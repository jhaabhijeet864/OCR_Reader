import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

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

  // API health check with polling (updates if server starts after client)
  useEffect(() => {
    let attempts = 0;
    const check = () => {
      fetch('http://localhost:3000/')
        .then(r => (r.ok ? r.json() : Promise.reject(r.status)))
        .then(() => setApiStatus('online'))
        .catch(() => setApiStatus('offline'));
      attempts += 1;
    };
    // Initial check
    check();
    // Poll every 3s until online, then stop
    const interval = setInterval(() => {
      if (apiStatus === 'online') {
        clearInterval(interval);
        return;
      }
      check();
    }, 3000);
    return () => clearInterval(interval);
  }, [apiStatus]);

  return (
    <div className="container">
      <div className="api-status">
        API: <strong style={{color: apiStatus==='online' ? '#28a745':'#dc3545'}}>{apiStatus}</strong>
      </div>
      <h1>Finance Document Q&A</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="file-upload">Upload PDF Document:</label>
          <input 
            id="file-upload" 
            type="file" 
            accept=".pdf"
            onChange={handleFileChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="query-input">Ask a question:</label>
          <input 
            id="query-input" 
            type="text" 
            placeholder="e.g., What is the total amount?"
            value={query}
            onChange={handleQueryChange}
          />
        </div>
        <button type="submit">Upload & Process Document</button>
      </form>

      {uploadResponse && (
        <div className="success-panel">
          <h3>✅ Document Processed Successfully!</h3>
          <p><strong>Chunks created:</strong> {uploadResponse.chunkCount}</p>
          <p><strong>Embeddings generated:</strong> {uploadResponse.embeddings}</p>
          
          <div style={{marginTop: '15px'}}>
            <button 
              onClick={handleSearch} 
              disabled={isSearching || !query.trim()}
              className="search-button"
            >
              {isSearching ? 'Searching...' : 'Search Document'}
            </button>
          </div>
        </div>
      )}

      {/* Display immediate answer from upload */}
      {answer && (
        <div className="search-results">
          <h3>🤖 AI Answer</h3>
          {uploadResponse?.initialQuery && (
            <p style={{fontStyle: 'italic', marginBottom: '1rem'}}>
              Question: "{uploadResponse.initialQuery}"
            </p>
          )}
          
          <div className="ai-answer">
            <h4>Answer:</h4>
            <p style={{
              backgroundColor: '#e8f5e8',
              padding: '1rem',
              borderRadius: '8px',
              lineHeight: '1.6',
              fontSize: '1rem'
            }}>
              {answer}
            </p>
          </div>

          {answerSources.length > 0 && (
            <div className="sources-section" style={{marginTop: '1.5rem'}}>
              <h4>📄 Sources ({answerSources.length} relevant chunks found):</h4>
              {answerSources.map((source) => (
                <div key={source.id} className="result-item">
                  <h5>Source {source.id}</h5>
                  <p>{source.preview}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Display answer error if initial generation failed */}
      {answerError && (
        <div style={{
          marginTop: '1rem', 
          padding: '1rem', 
          backgroundColor: '#f8d7da', 
          border: '1px solid #f5c6cb',
          borderRadius: '8px',
          color: '#721c24'
        }}>
          <h4 style={{marginTop: 0}}>⚠️ Answer Generation Failed</h4>
          <p>Embeddings created successfully, but couldn't generate an initial answer:</p>
          <p style={{fontStyle: 'italic'}}>{answerError}</p>
          <p>You can still search the document using the "Search Document" button above.</p>
        </div>
      )}

      {ragResponse && (
        <div className="search-results">
          <h3>🤖 AI Answer for: "{ragResponse.query}"</h3>
          
          <div className="ai-answer">
            <h4>Answer:</h4>
            <p style={{
              backgroundColor: '#e8f5e8',
              padding: '1rem',
              borderRadius: '8px',
              lineHeight: '1.6',
              fontSize: '1rem'
            }}>
              {ragResponse.answer}
            </p>
          </div>

          <div className="sources-section" style={{marginTop: '1.5rem'}}>
            <h4>📄 Sources ({ragResponse.retrievedChunks} relevant chunks found):</h4>
            {ragResponse.sources.map((source) => (
              <div key={source.id} className="result-item">
                <h5>Source {source.id}</h5>
                <p>{source.preview}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {lastError && (
        <div style={{marginTop: '2rem', padding: '1rem', border: '1px solid #f5c2c7', background: '#f8d7da', borderRadius: '8px'}}>
          <h4 style={{marginTop: 0}}>Last Error (debug)</h4>
          <pre style={{whiteSpace: 'pre-wrap'}}>{lastError.uiMessage}</pre>
          {lastError.raw && (
            <details style={{marginTop: '0.5rem'}}>
              <summary style={{cursor: 'pointer'}}>Raw server payload</summary>
              <pre style={{whiteSpace: 'pre-wrap', fontSize: '0.85rem'}}>{JSON.stringify(lastError.raw, null, 2)}</pre>
            </details>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
