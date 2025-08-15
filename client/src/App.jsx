import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  // State to track the selected file and query input
  const [selectedFile, setSelectedFile] = useState(null);
  const [query, setQuery] = useState('');
  const [apiStatus, setApiStatus] = useState('checking...');

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
      const response = await axios.post('http://localhost:3000/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('Server response:', response.data);
      alert('File uploaded successfully!');

    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file.');
    }
  };

  // Simple API health check
  useEffect(() => {
    fetch('http://localhost:3000/')
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(() => setApiStatus('online'))
      .catch(() => setApiStatus('offline'));
  }, []);

  return (
    <div className="container">
      <div style={{position:'absolute', top:10, right:10, fontSize:'0.85rem'}}>
        API: <strong style={{color: apiStatus==='online' ? 'limegreen':'crimson'}}>{apiStatus}</strong>
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
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default App;
