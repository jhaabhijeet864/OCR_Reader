import { useState, useEffect } from 'react';
import './App.css';

const API_PORT = 3000;
const apiBase = () => `http://${window.location.hostname}:${API_PORT}`;

function App() {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [query, setQuery] = useState('');
  const [apiStatus, setApiStatus] = useState('loading');
  const [uploading, setUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [answer, setAnswer] = useState('');
  const [steps, setSteps] = useState([]);
  const [error, setError] = useState(null);
  const [lastUploadId, setLastUploadId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch(`${apiBase()}/api/ping`);
        if (!cancelled) {
          if (r.ok) setApiStatus('ok');
          else {
            console.warn('Ping failed status', r.status);
            setApiStatus('error');
          }
        }
      } catch (err) {
        console.error('Ping network error', err);
        if (!cancelled) setApiStatus('error');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleFileInput = (e) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setAnswer('');
      setSteps([]);
      setError(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files?.[0]) {
      setFile(e.dataTransfer.files[0]);
      setAnswer('');
      setSteps([]);
      setError(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragging(false);
  };

  const uploadFile = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    
    try {
      const fd = new FormData();
      fd.append('file', file);
      const r = await fetch(`${apiBase()}/api/upload`, { 
        method: 'POST', 
        body: fd 
      });
      
      if (!r.ok) throw new Error(await r.text());
      
      const data = await r.json();
      setLastUploadId(data?.uploadId || Date.now().toString());
    } catch (e) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  };

  const askAgent = async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    setError(null);
    setAnswer('');
    setSteps([]);
    
    try {
      const r = await fetch(`${apiBase()}/api/agent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Agent error');
      
      setAnswer(data.answer || '(No answer)');
      setSteps(data.agentSteps || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setAnswer('');
    setSteps([]);
    setQuery('');
    setError(null);
  };

  const resetAll = () => {
    setFile(null);
    setLastUploadId(null);
    clearResults();
  };

  const statusClass = apiStatus === 'ok' ? 'ok' : apiStatus === 'error' ? 'error' : 'loading';
  const hasResults = answer || steps.length > 0;

  return (
    <div className="app-container">
      <div className="app-shell">
        {/* Header */}
        <header className="header fade-in">
          <h1 className="header-title">Finance AI Workspace</h1>
          <p className="header-subtitle">
            Intelligent document analysis with multi-tool AI reasoning
          </p>
          <div className="feature-badges">
            <span className="badge">
              🧠 Smart Agent
            </span>
            <span className="badge">
              📄 Document Search
            </span>
            <span className="badge">
              💱 Currency Converter
            </span>
            <span className="badge">
              ⚡ Real-time Processing
            </span>
          </div>
        </header>

        {/* Upload Panel */}
        <div className="glass-panel slide-up">
          <h2 className="panel-title">
            <span className="panel-icon">📤</span>
            Upload Invoice PDF
          </h2>
          
          <div
            className={`upload-zone ${dragging ? 'drag-active' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('fileInput').click()}
          >
            <div className="upload-icon">
              {file ? '✅' : '📁'}
            </div>
            <div className="upload-text">
              {file ? `Selected: ${file.name}` : 'Drop PDF here or click to browse'}
            </div>
            <div className="upload-hint">
              Supports PDF files up to 10MB • Extracts text for AI analysis
            </div>
            <input
              id="fileInput"
              type="file"
              accept="application/pdf"
              onChange={handleFileInput}
            />
          </div>

          <div className="form-section">
            <div className="btn-group">
              <button
                className={`btn btn-primary ${uploading ? 'btn-loading' : ''}`}
                disabled={!file || uploading}
                onClick={uploadFile}
              >
                {uploading ? 'Processing...' : lastUploadId ? 'Re-Upload' : 'Upload & Process'}
              </button>
              <button
                className="btn btn-secondary"
                disabled={!lastUploadId || uploading}
                onClick={resetAll}
              >
                🗑️ Reset
              </button>
            </div>
            
            <div className="status-line">
              <span className={`status-dot ${statusClass}`}></span>
              <span>API: {apiStatus}</span>
              {lastUploadId && (
                <span style={{color: '#48bb78', fontWeight: 500}}>
                  ✅ Vector store ready
                </span>
              )}
              {error && (
                <span style={{color: '#f56565', fontWeight: 500}}>
                  ❌ {error}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Query Panel */}
        <div className="glass-panel slide-up" style={{animationDelay: '0.1s'}}>
          <h2 className="panel-title">
            <span className="panel-icon">🤖</span>
            Ask the AI Agent
          </h2>
          
          <div className="form-section">
            <label className="form-label" htmlFor="queryInput">
              Your Question
            </label>
            <input
              id="queryInput"
              className="form-input"
              placeholder="What is the total amount and its value in INR?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) askAgent(); }}
            />
            
            <div className="btn-group">
              <button
                className={`btn btn-primary ${isLoading ? 'btn-loading' : ''}`}
                disabled={!lastUploadId || isLoading}
                onClick={askAgent}
              >
                {isLoading ? 'AI Thinking...' : '🚀 Run Agent'}
              </button>
              <button
                className="btn btn-secondary"
                disabled={isLoading}
                onClick={clearResults}
              >
                🧹 Clear
              </button>
            </div>
          </div>

          {/* Results */}
          {hasResults && (
            <div className="results-container fade-in">
              {answer && (
                <div className="answer-card">
                  <div className="answer-header">
                    <span className="panel-icon">💡</span>
                    <h3 className="answer-title">AI Response</h3>
                  </div>
                  <div className="answer-content">{answer}</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Agent Steps Panel */}
        <div className="glass-panel steps-panel slide-up" style={{animationDelay: '0.2s'}}>
          <h2 className="panel-title">
            <span className="panel-icon">🔍</span>
            Agent Reasoning Steps
          </h2>
          
          <div className="steps-container">
            {steps.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  {isLoading ? '⏳' : '💭'}
                </div>
                <div className="empty-text">
                  {isLoading ? 'Agent is analyzing...' : 'Ask a question to see AI reasoning'}
                </div>
              </div>
            ) : (
              steps.map((step, index) => (
                <div key={index} className="step-item fade-in" style={{animationDelay: `${index * 0.1}s`}}>
                  <div className="step-header">
                    <div className="step-number">{index + 1}</div>
                    <div className="step-title">
                      {step.action || step.tool || 'Processing'}
                    </div>
                  </div>
                  
                  {step.input && (
                    <div style={{marginBottom: 12}}>
                      <strong style={{color: '#667eea'}}>Input:</strong>
                      <div className="step-content">
                        {typeof step.input === 'string' ? step.input : JSON.stringify(step.input, null, 2)}
                      </div>
                    </div>
                  )}
                  
                  {(step.output || step.observation) && (
                    <div>
                      <strong style={{color: '#48bb78'}}>Output:</strong>
                      <div className="step-content">
                        {truncate(step.output || step.observation, 500)}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="footer">
          <div>
            Finance AI Workspace • Built with React + LangChain + Gemini AI
          </div>
          <div style={{marginTop: 8, opacity: 0.6}}>
            Showcase Project • {new Date().getFullYear()}
          </div>
        </footer>
      </div>
    </div>
  );
}

function truncate(str, max) {
  if (!str) return '';
  return str.length > max ? str.slice(0, max) + '...' : str;
}

export default App;
