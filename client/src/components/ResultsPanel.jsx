import React from 'react';
import styles from './components.module.css';

export default function ResultsPanel({ answer, isLoading }) {
  return (
    <div className={`glass-panel slide-up ${styles.delay10}`}>
      <h2 className="panel-title"><span className="panel-icon">💡</span>Answer</h2>
      {answer ? (
        <div className="answer-card" role="region" aria-label="AI Answer">
          <div className="answer-content">{answer}</div>
        </div>
      ) : (
        <div className="answer-card placeholder" role="region" aria-label="Waiting for answer">
          {isLoading ? (
            <>
              Generating answer
              <div className="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </>
          ) : (
            <>Run a query to see the AI answer here.</>
          )}
        </div>
      )}
    </div>
  );
}
