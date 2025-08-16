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
import { StringOutputParser } from '@langchain/core/output_parsers';

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

// Helper: generate grounded answer using current vectorStore
async function generateAnswer(query) {
  if (!vectorStore) throw new Error('Vector store not ready');
  
  const relevant = await vectorStore.similaritySearch(query, 4);
  console.log(`Retrieved ${relevant.length} chunks for query: ${query}`);
  
  const context = relevant
    .map((c, i) => `Source ${i + 1}:\n${c.pageContent}`)
    .join('\n\n');
  
  const convo = conversationHistory.slice(-3)
    .map(h => `Q: ${h.query}\nA: ${h.answer}`)
    .join('\n');
  
  const promptTemplate = ChatPromptTemplate.fromTemplate(
`You are a strict grounded QA assistant.
ONLY answer using the provided context.
If the answer is not contained, reply exactly: "I cannot find this information in the provided document."

{conversationSection}Context:
{context}

Question: {question}

Answer:`);

  const filled = await promptTemplate.format({
    context,
    question: query,
    conversationSection: convo ? `Previous conversation:\n${convo}\n\n` : ''
  });

  console.log('Generating answer with Gemini...');
  const aiMsg = await llm.invoke(filled);
  const answer = normalizeAiContent(aiMsg);

  conversationHistory.push({ query, answer });
  if (conversationHistory.length > 10) conversationHistory = conversationHistory.slice(-10);

  return {
    answer,
    retrievedChunks: relevant.length,
    sources: relevant.map((c, i) => ({
      id: i + 1,
      preview: c.pageContent.slice(0, 200) + (c.pageContent.length > 200 ? '...' : '')
    }))
  };
}

app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

// Global unhandled rejection logging
process.on('unhandledRejection', (r) => {
  console.error('[UnhandledRejection]', r);
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

app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });

    const initialQuery = (req.body.query || '').trim();
    console.log('Received file:', req.file.originalname);
    console.log('Initial query:', initialQuery || '(none)');

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
      vectorStore = await MemoryVectorStore.fromTexts(
        chunks,
        chunks.map((_, i) => ({ id: i })),
        embeddings
      );
      console.log('Vector store ready');
    } catch (e) {
      console.error('Embedding creation failed:', e);
      return res.status(500).json({ message: 'Embedding creation failed', error: e.message });
    }

    // --- Generate initial answer if query provided ---
    let ragPayload = null;
    if (initialQuery) {
      try {
        console.log('Generating initial answer...');
        ragPayload = await generateAnswer(initialQuery);
        console.log('Initial answer generated successfully');
      } catch (genErr) {
        console.error('Initial answer generation failed:', genErr);
        ragPayload = { answerError: genErr.message };
      }
    }

    const response = {
      message: 'File processed successfully!',
      chunkCount: chunks.length,
      embeddings: chunks.length,
      initialQuery: initialQuery || null
    };

    // Add RAG results if available
    if (ragPayload) {
      Object.assign(response, ragPayload);
    }

    res.json(response);
  } catch (e) {
    console.error('Upload error:', e);
    res.status(500).json({ message: 'Server error during upload', error: e.message });
  }
});

// Rebuilt RAG endpoint using a LangChain chain
app.post('/api/search', async (req, res) => {
  const { query } = req.body || {};
  if (!vectorStore) return res.status(400).json({ message: 'No document uploaded yet.' });
  if (!query) return res.status(400).json({ message: 'Query is required.' });

  console.log('RAG query (search endpoint):', query);

  try {
    const result = await generateAnswer(query);
    res.json({
      message: 'RAG success',
      query,
      ...result
    });
  } catch (e) {
    console.error('RAG error (outer):', e);
    res.status(500).json({
      message: 'RAG query failed',
      error: e.message || String(e)
    });
  }
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

app.listen(port, () => {
  console.log(`Server listening http://localhost:${port}`);
  console.log(`Gemini configured: ${!!process.env.GOOGLE_API_KEY}`);
});
