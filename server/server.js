import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

// Root route for API health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'Finance Document Q&A Server is running!', 
    endpoints: ['POST /api/upload'] 
  });
});

app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const query = req.body.query;

    console.log('Received file:', file.originalname);
    console.log('Received query:', query);

    // Lazy-load pdf-parse to avoid module resolution side-effects at startup
    const pdf = require('pdf-parse');
    const dataBuffer = fs.readFileSync(file.path);
    const pdfData = await pdf(dataBuffer);
    
    // --- Chunk the extracted text ---
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000, // Max characters per chunk
      chunkOverlap: 150, // Characters to overlap between chunks
    });

    const chunks = await splitter.splitText(pdfData.text);
    
    console.log('--- Text Chunking Complete ---');
    console.log(`Document split into ${chunks.length} chunks.`);
    console.log('First chunk:', chunks[0]);
    console.log('----------------------------');
    // ------------------------------------

    res.json({ message: 'File chunked successfully!', chunkCount: chunks.length });
  
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).json({ message: 'Error processing file.' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
