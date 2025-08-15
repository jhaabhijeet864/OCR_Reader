import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import { createRequire } from 'module';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const require = createRequire(import.meta.url);

const app = express();
const port = 3000;

// Initialize Gemini AI Embeddings (verify API key is loaded)
const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GOOGLE_API_KEY,
  modelName: "embedding-001"
});

// Store vector store in memory (will be replaced per upload)
let vectorStore = null;

app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

// Root route for API health check
app.get('/', (req, res) => {
  const hasApiKey = !!process.env.GOOGLE_API_KEY;
  const hasVectorStore = !!vectorStore;
  res.json({ 
    message: 'Finance Document Q&A Server is running!', 
    endpoints: ['POST /api/upload', 'POST /api/search', 'GET /api/test-embedding'],
    geminiConfigured: hasApiKey,
    vectorStoreReady: hasVectorStore
  });
});

// Test endpoint to verify embedding setup
app.get('/api/test-embedding', async (req, res) => {
  try {
    console.log('Testing embedding API...');
    const testText = ["Hello world"];
    const testEmbedding = await embeddings.embedDocuments(testText);
    res.json({
      message: 'Embedding test successful',
      embeddingLength: testEmbedding[0]?.length || 0,
      success: true
    });
  } catch (error) {
    console.error('Embedding test failed:', error);
    res.status(500).json({
      message: 'Embedding test failed',
      error: error.message,
      success: false
    });
  }
});

app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const query = req.body.query;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    console.log('Received file:', file.originalname);
    console.log('Received query:', query);

    // Lazy-load pdf-parse to avoid module resolution side-effects at startup
    let pdf;
    try {
      pdf = require('pdf-parse');
    } catch (pdfError) {
      console.error('Error loading pdf-parse:', pdfError);
      return res.status(500).json({ message: 'PDF parsing library not available.' });
    }

    const dataBuffer = fs.readFileSync(file.path);
    let pdfData;
    try {
      pdfData = await pdf(dataBuffer);
    } catch (parseError) {
      console.error('Error parsing PDF:', parseError);
      return res.status(500).json({ message: 'Error parsing PDF file. Please ensure it\'s a valid PDF.' });
    }
    
    // --- Chunk the extracted text ---
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000, // Max characters per chunk
      chunkOverlap: 150, // Characters to overlap between chunks
    });

    const chunks = await splitter.splitText(pdfData.text);
    
    console.log('--- Text Chunking Complete ---');
    console.log(`Document split into ${chunks.length} chunks.`);
    console.log('First chunk:', chunks[0]);
    
    // --- Create Embeddings and Vector Store ---
    console.log('--- Creating embeddings and vector store ---');
    
    try {
      // Create vector store from text chunks using Gemini embeddings
      vectorStore = await MemoryVectorStore.fromTexts(
        chunks,
        chunks.map((_, i) => ({ chunkIndex: i })), // metadata for each chunk
        embeddings
      );
      
      console.log('Vector store created successfully with', chunks.length, 'embeddings');
      console.log('----------------------------');

      res.json({ 
        message: 'File processed and embeddings created successfully!', 
        chunkCount: chunks.length,
        embeddings: vectorStore ? chunks.length : 0,
        geminiReady: !!process.env.GOOGLE_API_KEY
      });
      
    } catch (embeddingError) {
      console.error('Error creating embeddings:', embeddingError);
      console.error('Error details:', embeddingError.stack);
      res.status(500).json({ 
        message: 'File chunked but embedding creation failed.',
        chunkCount: chunks.length,
        error: embeddingError.message
      });
    }
  
  } catch (error) {
    console.error('Error processing file:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Error processing file.', error: error.message });
  }
});

// Test endpoint for vector similarity search
app.post('/api/search', async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!vectorStore) {
      return res.status(400).json({ 
        message: 'No document uploaded yet. Please upload a PDF first.' 
      });
    }

    if (!query) {
      return res.status(400).json({ 
        message: 'Query is required.' 
      });
    }

    console.log('Searching for:', query);
    
    // Perform similarity search
    const results = await vectorStore.similaritySearch(query, 3); // Get top 3 matches
    
    console.log(`Found ${results.length} relevant chunks`);
    results.forEach((result, i) => {
      console.log(`Chunk ${i + 1}:`, result.pageContent.substring(0, 100) + '...');
    });

    res.json({
      message: 'Search completed successfully',
      query,
      results: results.map((result, i) => ({
        rank: i + 1,
        content: result.pageContent,
        metadata: result.metadata
      }))
    });

  } catch (error) {
    console.error('Error during search:', error);
    res.status(500).json({ message: 'Error during search.', error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log(`Gemini API configured: ${!!process.env.GOOGLE_API_KEY}`);
});
