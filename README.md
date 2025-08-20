# Financial Document AI Assistant

An advanced full-stack application leveraging AI for financial document analysis. The system enables robust PDF ingestion, intelligent Q&A, semantic search, and currency conversion, all in a modern, responsive interface. Designed for analysts, finance teams, and researchers, this project showcases best practices in AI integration, scalable architecture, and professional software engineering.


## Features

- **Document Upload & Processing**: Securely upload financial PDFs; automatic text extraction.
- **AI Q&A**: Ask natural-language questions about your uploaded documents using Google Gemini and LangChain.
- **Semantic Vector Search**: Retrieve relevant document passages using embedding-based search.
- **Currency Conversion**: Real-time conversion, including INR and major global currencies.
- **Financial Metric Visualization**: Key figures and trends visualized with interactive charts.
- **Responsive UI**: Optimized for desktop and mobile; clean design with 3D visual effects.
- **API Health Monitoring**: Frontend displays real-time backend status.

## Tech Stack

**Backend**
- Node.js + Express.js
- Google Generative AI (Gemini 1.5 Flash)
- LangChain JS (agent orchestration, semantic retrieval)
- pdf-parse (PDF text extraction)
- Multer (file uploads)
- CORS, dotenv

**Frontend**
- React 18 (TypeScript) + Vite
- Tailwind CSS & shadcn/ui
- React Query (API state)
- Spline (3D background)
- Lucide React (icons)
- Sonner (notifications)

## Project Structure

```
financial-doc-agent/
├── client/                 # React frontend
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── index.css
│   │   └── main.tsx
│   ├── public/
│   └── vite.config.ts
├── server/                 # Express backend
│   ├── routes/
│   ├── utils/
│   ├── services/
│   ├── server.js
│   └── uploads/            # (gitignored)
├── .env                    # (gitignored)
├── .gitignore
└── README.md
```

## Quickstart

### Prerequisites

- Node.js v16+
- npm or yarn
- Google Generative AI API key

### Installation

```bash
git clone https://github.com/jhaabhijeet864/financial-doc-agent.git
cd financial-doc-agent

# Server setup
cd server
npm install

# Client setup
cd ../client
npm install
```

Configure your API key in `server/.env`:
```
GOOGLE_API_KEY=your_google_gemini_api_key
PORT=3000
```

### Running Locally

1. **Start backend:**  
   ```bash
   cd server
   npm start
   ```
   (Runs at http://localhost:3000)

2. **Start frontend:**  
   ```bash
   cd client
   npm run dev
   ```
   (Runs at http://localhost:5173)

### Usage

- Open http://localhost:5173
- Confirm API status ("Connected" badge)
- Upload a PDF and interact via the Q&A chat
- Use currency conversion and visualize metrics

## API Reference

- **GET `/api/status`** — Health check, returns status/version
- **POST `/api/upload`** — Upload PDF (`multipart/form-data`), returns document ID
- **POST `/api/agent`** — Query AI agent (`{ query: string }`)
- **POST `/api/search`** — Semantic search (`{ query: string }`)
- **GET `/api/convert`** — Currency conversion (`amount`, `from`, `to`)

## System Design Highlights

- **Retrieval Augmented Generation (RAG):** Embedding-powered chunking and retrieval for robust context support.
- **Agent Architecture:** LangChain zero-shot agent with custom tools for search and conversion.
- **Security:** All uploads handled securely via Multer; environment variables for sensitive data.
- **Scalability:** Modular services and stateless API endpoints.

## Troubleshooting

- **API Disconnected:**  
  - Ensure backend runs on port 3000  
  - Check CORS/network  
  - Verify Google API key

- **Upload Issues:**  
  - Check PDF validity, file size  
  - Ensure write permissions for uploads directory

- **Empty AI Answers:**  
  - Confirm successful document upload  
  - Review backend logs for errors

## Contributing

Professional contributions are welcome.  
- Fork this repo
- Create a feature branch
- Submit a clear pull request

## License

MIT

---

## Maintainer

**Abhijeet Jha**  
_Machine Learning Engineer_

For technical queries or collaborations, reach out via [GitHub Issues](https://github.com/jhaabhijeet864/financial-doc-agent/issues).

