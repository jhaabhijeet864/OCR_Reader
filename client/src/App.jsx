import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './App.css';

const API_PORT = 3000;
const apiBase = () => `http://${window.location.hostname}:${API_PORT}`;

function App() {
  // State to track the selected file and query input
  const [selectedFile, setSelectedFile] = useState(null);
  const [query, setQuery] = useState('');
  const [apiStatus, setApiStatus] = useState('checking...');
  const [uploadResponse, setUploadResponse] = useState(null);
  const [ragResponse, setRagResponse] = useState(null); // Add this state
  const [isSearching, setIsSearching] = useState(false);
  const [lastError, setLastError] = useState(null);
  const [answer, setAnswer] = useState('');
  const [answerSources, setAnswerSources] = useState([]);
  const [answerError, setAnswerError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch(`${apiBase()}/api/ping`).catch(()=>null);
        if (cancelled) return;
        setApiStatus(r && r.ok ? 'ok' : 'error');
      } catch {
        if (!cancelled) setApiStatus('error');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleQueryChange = (e) => {
    setQuery(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Check if a file is selected
    if (!selectedFile) {
      alert("Please select a file first!");
      return;
    }

    // 2. Create a FormData object
    const formData = new FormData();

    // 3. Append the file and the query.
    // The key 'file' MUST match the name in your server's upload.single('file')
    formData.append('file', selectedFile);
    formData.append('query', query);

    // 4. Send the data to the server using axios
    try {
      console.log('Uploading file:', selectedFile.name);
      const response = await axios.post('http://localhost:3000/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('Server response:', response.data);
      setUploadResponse(response.data);
      
      // Handle initial answer if provided
      if (response.data.answer) {
        setAnswer(response.data.answer);
        setAnswerSources(response.data.sources || []);
        setAnswerError('');
      } else if (response.data.answerError) {
        setAnswerError(response.data.answerError);
        setAnswer('');
        setAnswerSources([]);
      } else {
        setAnswer('');
        setAnswerSources([]);
        setAnswerError('');
      }
      
      if (response.data.embeddings > 0) {
        const successMsg = response.data.answer 
          ? `File uploaded and question answered! Created ${response.data.embeddings} embeddings.`
          : `File uploaded successfully! Created ${response.data.embeddings} embeddings.`;
        alert(successMsg);
      } else {
        alert(`File uploaded but no embeddings created. Check server logs.`);
      }

    } catch (error) {
      console.error('Error uploading file:', error);
      
      let errorMessage = 'Error uploading file.';
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
      
      // Show detailed error info
      if (error.response && error.response.data) {
        console.error('Server error details:', error.response.data);
      }
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) {
      alert("Please enter a question first!");
      return;
    }

    if (!uploadResponse || !uploadResponse.embeddings) {
      alert("Please upload a document first!");
      return;
    }

    setIsSearching(true);
    setRagResponse(null); // Clear previous results
    setLastError(null);
    
    try {
      const response = await axios.post('http://localhost:3000/api/search', {
        query: query
      });
      
      console.log('RAG response:', response.data);
      setRagResponse(response.data);
      
      // Update answer state for follow-up questions
      if (response.data.answer) {
        setAnswer(response.data.answer);
        setAnswerSources(response.data.sources || []);
        setAnswerError('');
      }
      
    } catch (error) {
      console.error('Error during RAG query:', error);
      
      let errorMessage = 'Error during search.';
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
        // Capture server-provided deeper error detail if present
        if (error.response.data.error) {
          errorMessage += `\nDetails: ${error.response.data.error}`;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
      setLastError({
        uiMessage: errorMessage,
        raw: error?.response?.data || null
      });
    } finally {
      setIsSearching(false);
    }
  };

  const statusClass = apiStatus === 'ok' ? 'ok' : apiStatus === 'error' ? 'err' : 'loading';

  return (
    <div className="app-shell">
      <div className="header">
        <h1>Finance AI Workspace</h1>
        <div className="badges">
          <span className="badge"><span style={{fontSize:10}}>🧠</span> Multi‑Tool Agent</span>
          <span className="badge"><span style={{fontSize:10}}>📄</span> Document Search</span>
          <span className="badge"><span style={{fontSize:10}}>💱</span> Currency Convert</span>
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
            {selectedFile ? selectedFile.name : 'Drag & drop PDF or click to browse'}
          </div>
          <div className="helper">
            Only PDF. Extracted into chunks for semantic search.
          </div>
          <input id="fileInput" type="file" accept="application/pdf" onChange={handleFileChange} />
        </div>

        <div className="form-section">
          <div className="actions">
            <button disabled={!selectedFile || uploading} onClick={handleSubmit}>
              {uploading ? 'Uploading...' : (lastUploadId ? 'Re‑Upload' : 'Upload')}
            </button>
            <button
              className="secondary"
              disabled={!lastUploadId || uploading}
              onClick={() => { setSelectedFile(null); setLastUploadId(null); setAnswer(''); setSteps([]); }}
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
          placeholder="e.g. What is the total amount and its value in INR?"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') ask(); }}
        />
        <div className="actions">
          <button disabled={!lastUploadId || asking} onClick={ask}>
            {asking ? 'Thinking...' : 'Run Agent'}
          </button>
          <button
            className="secondary"
            disabled={asking && !steps.length}
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
              {asking ? 'Agent reasoning...' : 'No steps yet. Ask a question.'}
            </div>
          )}
          {steps.map((s,i) => (
            <div className="step" key={i}>
              <h4>Step {i+1}: {s.action || s.tool || 'Action'}</h4>
              {s.toolInput && <div style={{marginBottom:6}}>
                <strong>Input:</strong> <code>{JSON.stringify(s.toolInput)}</code>
              </div>}
              {s.observation && <div>
                <strong>Output:</strong><div style={{marginTop:4}}><code>{truncate(s.observation, 420)}</code></div>
              </div>}
              {s.output && !s.observation && <div>
                <strong>Output:</strong><div style={{marginTop:4}}><code>{truncate(s.output, 420)}</code></div>
              </div>}
            </div>
          ))}
        </div>
      </div>

      <div className="footer">
        Finance AI Workspace • Demo build • {new Date().getFullYear()}
      </div>
    </div>
  );
}

function truncate(str, max) {
  if (!str) return '';
  return str.length > max ? str.slice(0, max) + '…' : str;
}

export default App;
