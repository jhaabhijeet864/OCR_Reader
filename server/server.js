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
let conversationHistory = [];
let documentSearchTool = null; // NEW
let agentExecutor = null; // NEW

// Legacy generateAnswer helper removed after agent integration cleanup.

app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

// Add ping endpoint early for health checks
app.get('/api/ping', (_req, res) => {
  res.json({ ok: true, time: Date.now() });
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
  res.json({
    message: 'Finance Document Q&A Server running',
    endpoints: ['POST /api/upload', 'POST /api/search', 'GET /api/test-embedding', 'GET /api/test-llm'],
    geminiConfigured: !!process.env.GOOGLE_API_KEY,
    vectorStoreReady: !!vectorStore
  });
});

// Test endpoint to verify embedding setup
app.get('/api/test-embedding', async (_req, res) => {
  try {
    const out = await embeddings.embedDocuments(['hello world']);
    res.json({ success: true, length: out[0]?.length || 0 });
  } catch (e) {
    console.error('Embedding test failed:', e);
    res.status(500).json({ success: false, error: e.message });
  }
});

app.get('/api/test-llm', async (_req, res) => {
  try {
    const answer = await llm.invoke([{ role: 'user', content: 'Reply with the single word OK.' }]);
    res.json({ success: true, answer: answer.content });
  } catch (e) {
    console.error('LLM test failed:', e);
    res.status(500).json({ success: false, error: e.message });
  }
});

app.get('/api/test-currency-tool', async (_req, res) => {
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
      // Create vector store and document search tool
      vectorStore = await MemoryVectorStore.fromTexts(
        chunks,
        chunks.map((_, i) => ({ id: i })),
        embeddings
      );
      
      // Create document search tool
      documentSearchTool = new DocumentSearchTool(
        () => vectorStore,
        llm, 
        conversationHistory
      );
      
      // Create the agent with access to both tools
      try {
        console.log('Creating Finance Agent...');
        agentExecutor = await createFinanceAgent(
          llm, 
          () => vectorStore,
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
  const { query } = req.body || {};
  if (!vectorStore) return res.status(400).json({ message: 'No document uploaded yet.' });
  if (!query) return res.status(400).json({ message: 'Query is required.' });
  if (!documentSearchTool) return res.status(500).json({ message: 'Document search tool not initialized.' });
  try {
    const raw = await documentSearchTool._call(query);
    if (raw.startsWith('Error:')) {
      return res.status(500).json({ message: 'RAG error', error: raw.substring(6).trim() });
    }
    // Split answer and sources
    const parts = raw.split(/\n\nSOURCES:\n/);
    const answerText = parts[0];
    let sources = [];
    if (parts[1]) {
      sources = parts[1].split(/\n/).map((l,i)=>({ id: i+1, preview: l.replace(/^Source \d+ preview: /,'') }));
    }
    res.json({ message: 'RAG success', query, answer: answerText, sources });
  } catch (e) {
    res.status(500).json({ message: 'RAG failure', error: e.message });
  }
});

// Add a new route for agent queries
app.post('/api/agent', async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ message: 'Query is required.' });
    }
    
    if (!agentExecutor) {
      return res.status(400).json({ 
        message: 'Agent not initialized. Please upload a document first.' 
      });
    }
    
    console.log(`Processing agent query: "${query}"`);
    
    // Execute the agent
    const result = await agentExecutor.invoke({
      input: query
    });
    
    console.log('Agent execution complete');
    
    // Format and return the response
    res.json({
  message: 'Agent finished successfully!', // ✅ Correct message
      query,
      answer: result.output,
      agentSteps: result.intermediateSteps?.map(step => ({
        action: step.action.tool,
        input: step.action.toolInput, 
        output: step.observation
      })) || []
    });
    
  } catch (error) {
    console.error('Agent error:', error);
    res.status(500).json({ 
      message: 'Error during agent execution',
      error: error.message
    });
  }
});

// Simple ping route to verify correct server instance
app.get('/ping', (_req, res) => res.send('pong'));

// Route inventory (debug)
app.get('/__routes', (_req, res) => {
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
