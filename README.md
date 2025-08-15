# Finance Document Q&A System

A full-stack application for uploading PDF financial documents, extracting text, and chunking it for AI-powered question answering.

## 🚀 Features

- **PDF Upload**: Upload financial PDF documents via web interface
- **Text Extraction**: Extract text content from PDF files using pdf-parse
- **Text Chunking**: Split extracted text into manageable chunks using LangChain
- **Real-time API Status**: Monitor server connectivity status
- **RESTful API**: Clean API endpoints for document processing

## 🛠️ Tech Stack

### Backend (Server)
- **Node.js** with Express.js framework
- **pdf-parse** for PDF text extraction
- **LangChain** for text chunking and splitting
- **Multer** for file upload handling
- **CORS** enabled for cross-origin requests

### Frontend (Client)
- **React** with Vite for fast development
- **Axios** for API communication
- **CSS** for styling
- **Real-time health check** for API connectivity

## 📁 Project Structure

```
Peakflo-Project/
├── client/                 # React frontend
│   ├── src/
│   │   ├── App.jsx        # Main React component
│   │   ├── App.css        # Component styles
│   │   ├── index.css      # Global styles
│   │   └── main.jsx       # React entry point
│   ├── public/            # Static assets
│   ├── package.json       # Client dependencies
│   └── vite.config.js     # Vite configuration
├── server/                # Express backend
│   ├── server.js          # Main server file
│   ├── package.json       # Server dependencies
│   └── uploads/           # File upload directory (gitignored)
├── .gitignore            # Git ignore rules
└── README.md             # This file
```

## 🚦 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Peakflo-Project
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

### Running the Application

1. **Start the API server** (Terminal 1)
   ```bash
   cd server
   npm start
   ```
   Server will run on: http://localhost:3000

2. **Start the React client** (Terminal 2)
   ```bash
   cd client
   npm run dev
   ```
   Client will run on: http://localhost:5173

### Usage

1. Open your browser and navigate to http://localhost:5173
2. Check that API status shows "online" in the top-right corner
3. Upload a PDF file using the file input
4. Enter a question about the document
5. Click "Submit" to process the document
6. Check the server console for chunking results

## 📡 API Endpoints

### `GET /`
- **Description**: Health check endpoint
- **Response**: Server status and available endpoints

### `POST /api/upload`
- **Description**: Upload and process PDF document
- **Body**: 
  - `file`: PDF file (multipart/form-data)
  - `query`: Question string
- **Response**: Success message with chunk count

## 🔧 Configuration

### Text Chunking Settings
- **Chunk Size**: 1000 characters
- **Chunk Overlap**: 150 characters
- **Splitter**: RecursiveCharacterTextSplitter

### Server Settings
- **Port**: 3000 (configurable)
- **Upload Directory**: `server/uploads/`
- **CORS**: Enabled for all origins

## 🐛 Troubleshooting

### Common Issues

1. **"Cannot GET /" Error**
   - Ensure the API server is running on port 3000
   - Check that the root route handler is properly configured

2. **API Status Shows "Offline"**
   - Verify the API server is running
   - Check for port conflicts
   - Try refreshing the browser page

3. **File Upload Fails**
   - Ensure the `uploads/` directory exists in the server folder
   - Check file size limits and PDF format

4. **Module Resolution Errors**
   - pdf-parse is lazy-loaded to avoid startup issues
   - Ensure all dependencies are properly installed

## 🔄 Development Workflow

1. Make changes to code
2. Test locally with both servers running
3. Commit changes: `git add . && git commit -m "Your message"`
4. Push to repository: `git push origin main`

## 📈 Future Enhancements

- [ ] Integration with LLM APIs for actual Q&A
- [ ] Document persistence and management
- [ ] User authentication and sessions
- [ ] Support for multiple document formats
- [ ] Advanced text preprocessing
- [ ] Real-time streaming responses

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

## 📝 Development Notes

### Phase 1 Status: ✅ Complete
- PDF upload and parsing
- Text chunking with LangChain
- Basic React frontend
- API health monitoring

### Next Phase: LLM Integration
- Connect to OpenAI/Anthropic APIs
- Implement context-aware question answering
- Add conversation history
- Improve user interface
