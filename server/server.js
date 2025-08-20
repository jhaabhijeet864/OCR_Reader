import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import { createRequire } from 'module';
import dotenv from 'dotenv';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { CurrencyConverterTool, DocumentSearchTool } from './tools/index.js';
import { createFinanceAgent } from './agents/financeAgent.js';

// Load environment variables
dotenv.config();
const require = createRequire(import.meta.url);

const app = express();
const port = 3000;

// Initialize Gemini AI Embeddings (verify API key is loaded)
const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GOOGLE_API_KEY,
  modelName: 'embedding-001'
});

// Use Chat wrapper (handles safety blocks & formatting)
const llm = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
  model: 'gemini-1.5-flash',
  temperature: 0.2,
  maxOutputTokens: 512
});

// Store vector store in memory (will be replaced per upload)
let vectorStore = null;
// Initialize conversation history as an array that can be referenced and modified
const conversationHistory = [];
let documentSearchTool = null;
let agentExecutor = null;

// Create a function that returns the current vector store
// This ensures the tools always access the latest version
const getVectorStore = () => {
  console.log("getVectorStore called, vectorStore is:", vectorStore ? "defined" : "undefined");
  return vectorStore;
};

app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

// Add ping endpoint early for health checks
app.get('/api/ping', (_req, res) => {
  console.log('[RouteHit] /api/ping');
  res.json({ ok: true, time: Date.now() });
});

// Lightweight status for client debugging
app.get('/api/status', (_req, res) => {
  console.log('[RouteHit] /api/status');
  res.json({
    vectorStoreReady: !!vectorStore,
    agentReady: !!agentExecutor,
    documentSearchTool: !!documentSearchTool,
    conversationTurns: conversationHistory.length
  });
});

// Global unhandled rejection logging
process.on('unhandledRejection', (r) => {
  console.error('[UnhandledRejection]', r);
});

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION', err);
});

// Root route for API health check
app.get('/', (_req, res) => {
  console.log('[RouteHit] /');
  res.json({
    message: 'Finance Document Q&A Server running',
    endpoints: ['POST /api/upload', 'POST /api/search', 'GET /api/test-embedding', 'GET /api/test-llm'],
    geminiConfigured: !!process.env.GOOGLE_API_KEY,
    vectorStoreReady: !!vectorStore
  });
});

// Test endpoint to verify embedding setup
app.get('/api/test-embedding', async (_req, res) => {
  console.log('[RouteHit] /api/test-embedding');
  try {
    const out = await embeddings.embedDocuments(['hello world']);
    res.json({ success: true, length: out[0]?.length || 0 });
  } catch (e) {
    console.error('Embedding test failed:', e);
    res.status(500).json({ success: false, error: e.message });
  }
});

app.get('/api/test-llm', async (_req, res) => {
  console.log('[RouteHit] /api/test-llm');
  try {
    const answer = await llm.invoke([{ role: 'user', content: 'Reply with the single word OK.' }]);
    res.json({ success: true, answer: answer.content });
  } catch (e) {
    console.error('LLM test failed:', e);
    res.status(500).json({ success: false, error: e.message });
  }
});

app.get('/api/test-currency-tool', async (_req, res) => {
  console.log('[RouteHit] /api/test-currency-tool');
  try {
    console.log('Testing currency converter tool...');
    
    // Create an instance of the tool
    const currencyTool = new CurrencyConverterTool();
    
    // Test with a sample amount
    const testAmount = "100";
    const result = await currencyTool._call(testAmount);
    
    res.json({
      success: true,
      toolName: currencyTool.name,
      toolDescription: currencyTool.description,
      testInput: testAmount,
      testOutput: result
    });
    
  } catch (error) {
    console.error('Currency tool test failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/test-agent', async (_req, res) => {
  console.log('[RouteHit] /api/test-agent');
  try {
    if (!agentExecutor) {
      return res.status(400).json({
        success: false,
        message: 'Agent not initialized. Upload a document first.'
      });
    }
    
    const testQuery = "What tools do you have access to?";
    console.log('Testing agent with query:', testQuery);
    
    const result = await agentExecutor.invoke({
      input: testQuery
    });
    
    res.json({
      success: true,
      query: testQuery,
      answer: result.output,
      steps: result.intermediateSteps?.map(step => ({
        tool: step.action.tool,
        input: step.action.toolInput,
        output: step.observation
      }))
    });
  } catch (error) {
    console.error('Agent test failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/upload', upload.single('file'), async (req, res) => {
  console.log('[RouteHit] POST /api/upload');
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });

  const initialQuery = (req.body.query || '').trim(); // Kept only for backward compatibility in response
  console.log('Received file:', req.file.originalname);

    // Lazy-load pdf-parse to avoid module resolution side-effects at startup
    let pdf;
    try {
      pdf = require('pdf-parse');
    } catch (e) {
      return res.status(500).json({ message: 'pdf-parse not installed', error: e.message });
    }

    const dataBuffer = fs.readFileSync(req.file.path);
    let pdfData;
    try {
      pdfData = await pdf(dataBuffer);
    } catch (e) {
      return res.status(400).json({ message: 'Failed to parse PDF', error: e.message });
    }

    // --- Chunk the extracted text ---
    const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 150 });
    const chunks = await splitter.splitText(pdfData.text || '');

    console.log(`Chunking complete: ${chunks.length} chunks`);

    // --- Create Embeddings and Vector Store ---
    try {
      console.log("Creating vector store from", chunks.length, "chunks");
      // Create vector store
      vectorStore = await MemoryVectorStore.fromTexts(
        chunks,
        chunks.map((_, i) => ({ id: i })),
        embeddings
      );
      
      console.log("Vector store created successfully");
      
      // Create document search tool with the getter function
      documentSearchTool = new DocumentSearchTool(
        getVectorStore, // Pass the function that returns the current vector store
        llm, 
        conversationHistory
      );
      
      // Create the agent with access to both tools
      try {
        console.log('Creating Finance Agent...');
        // Clear conversation history when uploading a new document
        conversationHistory.length = 0;
        
        agentExecutor = await createFinanceAgent(
          llm, 
          getVectorStore, // Pass the function that returns the current vector store
          conversationHistory
        );
        console.log('Finance Agent ready!');
      } catch (agentError) {
        console.error('Agent creation error:', agentError);
        // Continue even if agent creation fails - we'll fall back to RAG
      }
      
      console.log('Vector store and document search tool ready');
    } catch (e) {
      console.error('Embedding creation failed:', e);
      return res.status(500).json({ message: 'Embedding creation failed', error: e.message });
    }

    res.json({
      message: 'File processed successfully! Agent ready.',
      chunkCount: chunks.length,
      embeddings: chunks.length,
      initialQuery: initialQuery || null
    });
  } catch (e) {
    console.error('Upload error:', e);
    res.status(500).json({ message: 'Server error during upload', error: e.message });
  }
});

// Updated RAG endpoint to use the tool
app.post('/api/search', async (req, res) => {
  console.log('[RouteHit] POST /api/search');
  const { query } = req.body || {};
  
  console.log("Search API called with query:", query);
  console.log("Vector store status:", vectorStore ? "Available" : "Not available");
  console.log("Document search tool status:", documentSearchTool ? "Available" : "Not available");
  
  if (!vectorStore) {
    console.log("No vector store available");
    return res.status(400).json({ message: 'No document uploaded yet.' });
  }
  
  if (!query) {
    console.log("No query provided");
    return res.status(400).json({ message: 'Query is required.' });
  }
  
  if (!documentSearchTool) {
    console.log("Document search tool not initialized");
    return res.status(500).json({ message: 'Document search tool not initialized.' });
  }
  
  try {
    console.log("Calling document search tool with query:", query);
    const raw = await documentSearchTool._call(query);
    console.log("Search result:", raw.substring(0, 100) + "...");
    
    if (raw.startsWith('Error:')) {
      console.log("Search error:", raw);
      return res.status(500).json({ message: 'RAG error', error: raw.substring(6).trim() });
    }
    
    // Split answer and sources
    const parts = raw.split(/\n\nSOURCES:\n/);
    const answerText = parts[0];
    let sources = [];
    if (parts[1]) {
      sources = parts[1].split(/\n/).map((l,i)=>({ id: i+1, preview: l.replace(/^Source \d+ preview: /,'') }));
    }
    
    console.log("Returning search result with", sources.length, "sources");
    res.json({ message: 'RAG success', query, answer: answerText, sources });
  } catch (e) {
    console.error('RAG failure:', e);
    res.status(500).json({ message: 'RAG failure', error: e.message });
  }
});

// Add a new route for agent queries
app.post('/api/agent', async (req, res) => {
  console.log('[RouteHit] POST /api/agent');
  try {
    const { query } = req.body;
    console.log('Agent API called with query:', query);
    console.log('Agent executor status:', agentExecutor ? 'Available' : 'Not available');
    console.log('Vector store status:', vectorStore ? 'Available' : 'Not available');

    if (!query) return res.status(400).json({ message: 'Query is required.' });
    if (!agentExecutor) return res.status(400).json({ message: 'Agent not initialized. Please upload a document first.' });
    if (!vectorStore) return res.status(400).json({ message: 'No document data available. Please upload a document first.' });

    console.log(`Processing agent query: "${query}"`);
    const result = await agentExecutor.invoke({ input: query });
    console.log('Agent execution complete');

    const skippedTools = !result.intermediateSteps || result.intermediateSteps.length === 0;
    const outputText = result.output || '';
    const looksLikeFallback = /need the (financial )?document/i.test(outputText) || /no (financial )?document (was )?provided/i.test(outputText);
    let finalAnswer = outputText;
    let toolSteps = result.intermediateSteps || [];
    let fallbackApplied = false;

    if ((skippedTools || looksLikeFallback) && vectorStore) {
      console.log('[Agent] Missing tool usage or fallback detected; invoking direct document_search.');
      try {
        if (!documentSearchTool) {
          documentSearchTool = new DocumentSearchTool(getVectorStore, llm, conversationHistory);
        }
        const raw = await documentSearchTool._call(query);
        const parts = raw.split(/\n\nSOURCES:\n/);
        finalAnswer = parts[0];
        toolSteps = toolSteps.concat([{ action: { tool: 'document_search', toolInput: query }, observation: 'Executed fallback retrieval' }]);
        fallbackApplied = true;
      } catch (fbErr) {
        console.warn('[Agent] Fallback retrieval failed:', fbErr.message);
      }
    }

    conversationHistory.push({ query, answer: finalAnswer });
    if (conversationHistory.length > 20) conversationHistory.splice(0, conversationHistory.length - 20);

    res.json({
      message: 'Agent finished successfully!',
      query,
      answer: finalAnswer,
      skippedTools,
      fallbackApplied,
      agentSteps: toolSteps.map(step => ({
        action: step.action.tool,
        input: step.action.toolInput,
        output: step.observation
      }))
    });
  } catch (error) {
    console.error('Agent error:', error);
    res.status(500).json({ message: 'Error during agent execution', error: error.message });
  }
});

// Simple ping route to verify correct server instance
app.get('/ping', (_req, res) => { console.log('[RouteHit] /ping'); res.send('pong'); });

// Route inventory (debug)
app.get('/__routes', (_req, res) => {
  console.log('[RouteHit] /__routes');
  const routes = [];
  app._router.stack.forEach(l => {
    if (l.route && l.route.path) {
      const methods = Object.keys(l.route.methods).join(',').toUpperCase();
      routes.push(`${methods} ${l.route.path}`);
    }
  });
  res.json({ routes });
});

// Log routes once at startup (after definitions)
function logRegisteredRoutes() {
  try {
    const stack = app && app._router && Array.isArray(app._router.stack) ? app._router.stack : [];
    const routes = stack
      .filter(l => l.route && l.route.path)
      .map(l => `${Object.keys(l.route.methods).join(',').toUpperCase()} ${l.route.path}`);
    console.log('[RouteRegistry]', routes);
    if (!routes.length) {
      console.warn('[RouteRegistry] WARNING: No routes enumerated. Express 5 router layers may differ. Inspecting stack length:', stack.length);
    }
  } catch (err) {
    console.warn('[RouteRegistry] unable to enumerate routes:', err.message);
  }
}

app.listen(port, () => {
  console.log(`Server listening http://localhost:${port}`);
  console.log(`Gemini configured: ${!!process.env.GOOGLE_API_KEY}`);
  logRegisteredRoutes();
});

// Helper to normalize AI message content
function normalizeAiContent(aiMsg) {
  if (!aiMsg) return '';
  if (typeof aiMsg === 'string') return aiMsg;
  const c = aiMsg.content;
  if (Array.isArray(c)) {
    return c.map(p => (typeof p === 'string' ? p : (p.text || p.content || ''))).join('');
  }
  if (typeof c === 'string') return c;
  return aiMsg.text || '';
}
