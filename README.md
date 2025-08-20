# Financial Document AI Assistant

A full-stack application for analyzing financial documents using AI, featuring document upload, intelligent Q&A, currency conversion, and beautiful visualizations with a 3D interactive background.

![Financial Document AI](https://i.imgur.com/CvdUYTW.png)

## 🚀 Features

- **Document Processing**: Upload financial PDFs and automatically extract text
- **AI-Powered Q&A**: Ask questions about your documents and get intelligent answers
- **Vector Search**: Semantic document search using embeddings
- **Agent-Based Reasoning**: LangChain agent with tool orchestration
- **Currency Conversion**: Built-in tool to convert currencies (with INR support)
- **Financial Metrics**: Visualizations of key financial data points
- **Immersive UI**: Dynamic 3D background with Spline and transparent UI elements
- **Real-time API Status**: Monitor server connectivity status
- **Rainbow Animation**: Interactive visual feedback during AI processing
- **Mobile Responsive**: Works on all screen sizes

## 🛠️ Tech Stack

### Backend (Server)
- **Node.js** with Express.js framework
- **Google Generative AI** (Gemini 1.5 Flash) for embeddings and chat
- **LangChain JS** for agent orchestration and vector retrieval
- **pdf-parse** for PDF text extraction
- **RecursiveCharacterTextSplitter** for intelligent document chunking
- **MemoryVectorStore** for in-memory semantic search
- **Multer** for file upload handling
- **CORS** enabled for cross-origin requests
- **dotenv** for environment configuration

### Frontend (Client)
- **React 18** with TypeScript and Vite
- **Tailwind CSS** for styling with custom design system
- **shadcn/ui** component library
- **React Query** for server state management
- **Spline** for 3D background animations
- **Lucide React** for icon components
- **Sonner** for toast notifications
- **CSS animations** for interactive feedback

## 📁 Project Structure

```
financial-doc-agent/
├── client/                 # React frontend
│   ├── src/
│   │   ├── assets/        # Static assets and images
│   │   ├── components/    # React components
│   │   │   ├── ui/        # shadcn/ui components
│   │   │   └── ...        # Custom components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utilities and API functions
│   │   ├── pages/         # Page components
│   │   ├── index.css      # Global styles
│   │   └── main.tsx       # React entry point
│   ├── public/            # Public assets
│   └── vite.config.ts     # Vite configuration
├── server/                # Express backend
│   ├── routes/           # API route handlers
│   ├── utils/            # Helper utilities
│   ├── services/         # Business logic
│   ├── server.js         # Main server file
│   └── uploads/          # File upload directory (gitignored)
├── .env                  # Environment variables (gitignored)
├── .gitignore           # Git ignore rules
└── README.md            # This file
```

## 🚦 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager
- Google Generative AI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/jhaabhijeet864/financial-doc-agent.git
   cd financial-doc-agent
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

4. **Set up environment variables**
   Create a `.env` file in the server directory:
   ```
   GOOGLE_API_KEY=your_google_gemini_api_key
   PORT=3000
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
2. Check that the server status shows "Connected" in the interface
3. Upload a financial PDF document using the upload panel
4. Ask questions about your financial document in the chat interface
5. Try currency conversion features and explore financial metrics
6. Experience the interactive 3D background and animations

## 📡 API Endpoints

### `GET /api/status`
- **Description**: Health check endpoint
- **Response**: Server status and version information

### `POST /api/upload`
- **Description**: Upload and process PDF document
- **Body**: PDF file (multipart/form-data)
- **Response**: Success message with document ID

### `POST /api/agent`
- **Description**: Query the AI agent about documents
- **Body**: 
  - `query`: Question string
- **Response**: AI response with reasoning steps

### `POST /api/search`
- **Description**: Direct semantic search in documents
- **Body**: 
  - `query`: Search query string
- **Response**: Relevant document passages

### `GET /api/convert`
- **Description**: Convert currency values
- **Query Parameters**: 
  - `amount`: Numeric amount
  - `from`: Source currency code
  - `to`: Target currency code
- **Response**: Converted amount and rate information

## 🔧 Advanced Features

### RAG Implementation
- **Vector Embeddings**: Document chunks are embedded using Google Generative AI
- **Semantic Search**: Queries are converted to embeddings for similarity search
- **Context Window**: Top relevant chunks are used as context for the LLM

### Agent Architecture
- **LangChain Agent**: Uses chat-zero-shot-react-description agent type
- **Tool Integration**: Custom tools for document search and currency conversion
- **Fallback Mechanism**: Automatic direct search if agent reasoning fails

### UI Enhancements
- **Dynamic 3D Background**: Spline-powered interactive background animation
- **Rainbow Border Animation**: Visual feedback during AI processing
- **Collapsible Reasoning**: Expandable steps showing the agent's reasoning process
- **Transparent UI Elements**: Modern backdrop blur effects for readability

## 🐛 Troubleshooting

### Common Issues

1. **"API Disconnected" Error**
   - Ensure the API server is running on port 3000
   - Check for CORS issues or network connectivity
   - Verify your Google API key is valid

2. **Document Upload Fails**
   - Check file size limits and PDF format
   - Ensure server has proper permissions to write to uploads directory

3. **Agent Returns No Answer**
   - Verify that documents have been uploaded successfully
   - Check server logs for embedding or LLM errors
   - Try more specific questions related to the document content

## 📈 Future Enhancements

- [ ] User authentication and document management
- [ ] PDF annotation and highlighting
- [ ] Export/sharing capabilities
- [ ] Additional financial analysis tools
- [ ] Enhanced mobile experience
- [ ] Persistent storage for uploaded documents

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

## 📝 Development Status

### Phase 1: ✅ Complete
- Document upload and parsing
- Vector embedding and retrieval
- Basic React frontend
- API health monitoring

### Phase 2: ✅ Complete
- LLM integration with Google Generative AI
- Agent architecture with tools
- UI redesign with shadcn/ui
- Interactive 3D background

### Phase 3: 🔄 In Progress
- Enhanced financial analysis tools
- Multi-document comparison
- Historical data tracking
- Performance optimizations
