import React from 'react';
import styles from './components.module.css';

export default function QueryPanel({ query, setQuery, onAsk, onClear, disabled, isLoading }) {
  return (
    <div className={`glass-panel slide-up ${styles.delay05}`}>
      <h2 className="panel-title"><span className="panel-icon">🤖</span>Ask the AI Agent</h2>
      <div className="form-section">
        <label className="form-label" htmlFor="queryInput">Your Question</label>
        <input
          id="queryInput"
          className="form-input"
          placeholder="What is the total amount and its value in INR?"
          value={query}
          onChange={(e)=>setQuery(e.target.value)}
          onKeyDown={(e)=>{ if(e.key==='Enter' && !e.shiftKey) onAsk(); }}
          aria-label="Enter your question about the document"
          disabled={disabled || isLoading}
        />
        <div className="btn-group">
          <button 
            className={`btn btn-primary ${isLoading ? 'btn-loading' : ''}`} 
            disabled={disabled || isLoading || !query.trim()} 
            onClick={onAsk}
            aria-label="Run AI agent to answer your question"
          >
            {isLoading ? 'AI Thinking...' : <><span className={styles.desktopOnly}>🚀 Run Agent</span><span className={styles.mobileOnly}>🚀 Ask</span></>}
          </button>
          <button 
            className="btn btn-secondary" 
            disabled={isLoading || (!query.trim() && !onClear)} 
            onClick={onClear}
            aria-label="Clear current results"
          >
            <span className={styles.desktopOnly}>🧹 Clear</span>
            <span className={styles.mobileOnly}>🧹</span>
          </button>
        </div>
      </div>
    </div>
  );
}
