import React, { useState, useEffect } from 'react';
import './App.css';

const API_PORT = 3000;
const apiBase = () => `http://${window.location.hostname}:${API_PORT}`;

function App() {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [query, setQuery] = useState('');
  const [apiStatus, setApiStatus] = useState('loading');
  const [uploading, setUploading] = useState(false);
  // Unified loading state for agent question submission
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
          if (r.ok) {
            setApiStatus('ok');
          } else {
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

  function onFileInput(e) {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setAnswer('');
      setSteps([]);
    }
  }

  function onDrop(e) {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files?.[0]) {
      setFile(e.dataTransfer.files[0]);
      setAnswer('');
      setSteps([]);
    }
  }

  async function upload() {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const r = await fetch(`${apiBase()}/api/upload`, { method:'POST', body: fd });
      if (!r.ok) throw new Error(await r.text());
      const data = await r.json();
      setLastUploadId(data?.uploadId || Date.now().toString());
    } catch (e) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  }

  async function ask() {
    if (!query.trim()) return;
    setIsLoading(true);
    setError(null);
    setAnswer('');
    setSteps([]);
    try {
      const r = await fetch(`${apiBase()}/api/agent`, {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
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
  }

  const statusClass = apiStatus === 'ok' ? 'ok' : apiStatus === 'error' ? 'err' : 'loading';

  return (
    <div className="app-shell">
      <div className="header">
        <h1>Finance AI Workspace</h1>
        <div className="badges">
          <span className="badge">🧠 Agent</span>
          <span className="badge">📄 Search</span>
          <span className="badge">💱 FX</span>
        </div>
      </div>

      <div className="panel">
        <h2>1. Upload Invoice PDF</h2>
        <div
          className={`upload-zone ${dragging ? 'drag':''}`}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={e => { e.preventDefault(); setDragging(false); }}
          onDrop={onDrop}
          onClick={() => document.getElementById('fileInput').click()}
        >
          <div className="icon">📤</div>
          <div style={{fontSize:15, fontWeight:600}}>
            {file ? file.name : 'Drag & drop PDF or click to browse'}
          </div>
          <div className="helper">Only PDF. Parsed & chunked for semantic search.</div>
          <input id="fileInput" type="file" accept="application/pdf" onChange={onFileInput} />
        </div>

        <div className="form-section">
          <div className="actions">
            <button disabled={!file || uploading} onClick={upload}>
              {uploading ? 'Uploading...' : (lastUploadId ? 'Re-Upload' : 'Upload')}
            </button>
            <button
              className="secondary"
              disabled={!lastUploadId || uploading}
              onClick={() => { setFile(null); setLastUploadId(null); setAnswer(''); setSteps([]); }}
            >
              Reset
            </button>
          </div>
          <div className="status-line">
            <span className={`status-dot ${statusClass}`}></span>
            <span>API: {apiStatus}</span>
            {lastUploadId && <span style={{color:'#2563eb'}}>Vector store ready</span>}
            {error && <span style={{color:'#dc2626'}}>{error}</span>}
          </div>
        </div>
      </div>

      <div className="panel">
        <h2>2. Ask the Agent</h2>
        <label className="field-label" htmlFor="queryInput">Query</label>
        <input
          id="queryInput"
          className="query"
            placeholder="What is the total amount and its value in INR?"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') ask(); }}
        />
        <div className="actions">
          <button disabled={!lastUploadId || isLoading} onClick={ask}>
            {isLoading ? 'Agent is thinking…' : 'Run Agent'}
          </button>
          <button
            className="secondary"
            disabled={isLoading && !steps.length}
            onClick={() => { setAnswer(''); setSteps([]); setQuery(''); }}
          >
            Clear
          </button>
        </div>
        {answer && (
          <div className="results" style={{marginTop:24}}>
            <div className="answer-box">
              <h3>Answer</h3>
              <div>{answer}</div>
            </div>
          </div>
        )}
      </div>

      <div className="panel" style={{gridColumn:'1 / -1'}}>
        <h2>Agent Steps</h2>
        <div className="steps">
          {steps.length === 0 && (
            <div className="empty">
              {isLoading ? 'Agent reasoning...' : 'No steps yet. Ask a question.'}
            </div>
          )}
          {steps.map((s,i) => (
            <div className="step" key={i}>
              <h4>Step {i+1}: {s.action || s.tool || 'Action'}</h4>
              {s.toolInput && <div style={{marginBottom:6}}>
                <strong>Input:</strong> <code>{JSON.stringify(s.toolInput)}</code>
              </div>}
              {s.observation && <div>
                <strong>Output:</strong>
                <div style={{marginTop:4}}><code>{truncate(s.observation, 420)}</code></div>
              </div>}
              {s.output && !s.observation && <div>
                <strong>Output:</strong>
                <div style={{marginTop:4}}><code>{truncate(s.output, 420)}</code></div>
              </div>}
            </div>
          ))}
        </div>
      </div>

      <div className="footer">
        Finance AI Workspace • Demo • {new Date().getFullYear()}
      </div>
    </div>
  );
}

function truncate(str, max) {
  if (!str) return '';
  return str.length > max ? str.slice(0, max) + '…' : str;
}

export default App;
