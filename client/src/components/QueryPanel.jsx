import React from 'react';
import styles from './components.module.css';

// Added `answer` prop to render inline answer section per Task 2
export default function QueryPanel({ query, setQuery, onAsk, onClear, disabled, isLoading, answer }) {
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

        {/* Inline Answer Section (Task 2) */}
        {answer && (
          <div className="answer-container" aria-live="polite">
            <h3 className="answer-heading">Answer:</h3>
            <p className="answer-text">{answer}</p>
          </div>
        )}
      </div>
    </div>
  );
}
