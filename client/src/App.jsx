import { useState, useEffect } from 'react';
import './App.css';
import './responsive-additions.css';
import Header from './components/Header';
import UploadPanel from './components/UploadPanel';
import QueryPanel from './components/QueryPanel';
import ResultsPanel from './components/ResultsPanel';
import StepsViewer from './components/StepsViewer';
import compStyles from './components/components.module.css';

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
  const [showSteps, setShowSteps] = useState(true);

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
        <Header />
        <div className="layout-grid">
          <div className="workflow-column">
            <UploadPanel
              file={file}
              dragging={dragging}
              lastUploadId={lastUploadId}
              uploading={uploading}
              apiStatus={apiStatus}
              error={error}
              onFileChange={handleFileInput}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onUpload={uploadFile}
              onReset={resetAll}
            />

            <QueryPanel
              query={query}
              setQuery={setQuery}
              onAsk={askAgent}
              onClear={clearResults}
              disabled={!lastUploadId}
              isLoading={isLoading}
              answer={answer}
            />
          </div>

          <div className="insights-column">
            <ResultsPanel answer={answer} isLoading={isLoading} />
            <div className={`${compStyles.alignEnd} steps-toolbar`} style={{marginBottom: '12px', marginTop: '10px'}}>
              <button className="small-btn" onClick={()=>setShowSteps(s=>!s)} aria-label={showSteps ? 'Hide Steps' : 'Show Steps'}>
                {showSteps ? 'Hide Steps' : 'Show Steps'}
              </button>
            </div>
            <StepsViewer steps={steps} isLoading={isLoading} collapsed={!showSteps} />
          </div>
        </div>

        <footer className="footer">
          <div>Finance AI Workspace • Built with React + LangChain + Gemini AI</div>
          <div style={{marginTop:8, opacity:0.6}}>Showcase Project • {new Date().getFullYear()}</div>
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
