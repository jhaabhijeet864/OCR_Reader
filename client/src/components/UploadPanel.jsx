import React from 'react';
import styles from './components.module.css';

export default function UploadPanel({ file, dragging, lastUploadId, uploading, apiStatus, error, onFileChange, onDrop, onDragOver, onDragLeave, onUpload, onReset }) {
  const statusClass = apiStatus === 'ok' ? 'ok' : apiStatus === 'error' ? 'error' : 'loading';

  return (
    <div className="glass-panel slide-up">
      <h2 className="panel-title"><span className="panel-icon">📤</span>Upload Invoice PDF</h2>

      <div
        className={`upload-zone ${dragging ? 'drag-active' : ''}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => document.getElementById('fileInput')?.click()}
        aria-label="Upload PDF document"
        role="button"
        tabIndex={0}
        onKeyPress={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            document.getElementById('fileInput')?.click();
          }
        }}
      >
        <div className="upload-icon">{file ? '✅' : '📁'}</div>
        <div className="upload-text">{file ? `Selected: ${file.name}` : 'Drop PDF here or click to browse'}</div>
        <div className="upload-hint">
          <span className={styles.desktopOnly}>Supports PDF up to 10MB • Extracts text for AI analysis</span>
          <span className={styles.mobileOnly}>Upload PDF (max 10MB)</span>
        </div>
        <input 
          id="fileInput" 
          type="file" 
          accept="application/pdf" 
          onChange={onFileChange}
          style={{ position: 'absolute', opacity: 0, width: '1px', height: '1px' }}
          aria-hidden="true"
        />
      </div>

      <div className="form-section">
        <div className="btn-group">
          <button 
            className={`btn btn-primary ${uploading ? 'btn-loading' : ''}`} 
            disabled={!file || uploading} 
            onClick={onUpload}
          >
            {uploading ? 'Processing...' : lastUploadId ? 'Re-Upload' : 'Upload & Process'}
          </button>
          <button 
            className="btn btn-secondary" 
            disabled={!lastUploadId || uploading} 
            onClick={onReset}
          >
            🗑️ Reset
          </button>
        </div>

        <div className="status-line">
          <span className={`status-dot ${statusClass}`}></span>
          <span>API: {apiStatus}</span>
          {lastUploadId && <span style={{color:'#48bb78', fontWeight:500}}>✅ Vector store ready</span>}
          {error && <span style={{color:'#f56565', fontWeight:500}}>❌ {error}</span>}
        </div>
      </div>
    </div>
  );
}
