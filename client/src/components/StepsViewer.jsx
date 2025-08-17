import React from 'react';
import styles from './components.module.css';

export default function StepsViewer({ steps = [], isLoading = false, collapsed = false }) {
  return (
    <div className={`glass-panel steps-panel slide-up ${collapsed ? 'collapsed' : ''} ${styles.delay15}`}>
      <div className="panel-title" style={{marginBottom: collapsed ? 0 : 12}}>
        <span className="panel-icon">🔍</span>
        <span style={{flex:1}}>Agent Reasoning</span>
      </div>
      {!collapsed && (
        <div className="steps-container">
          {steps.length === 0 ? (
            <div className="empty-state" style={{padding:'24px 12px'}}>
              <div className="empty-icon">{isLoading ? '⏳' : '💭'}</div>
              <div className="empty-text">
                {isLoading ? (
                  <>
                    Agent is analyzing
                    <div className="loading-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </>
                ) : (
                  'Run a query to view chain-of-thought steps.'
                )}
              </div>
            </div>
          ) : (
            steps.map((step, index) => (
              <div 
                key={index} 
                className="step-item fade-in" 
                style={{animationDelay: `${index * 0.06}s`}}
                aria-label={`Step ${index + 1}: ${step.action || step.tool || 'Processing'}`}
              >
                <div className="step-header">
                  <div className="step-number">{index + 1}</div>
                  <div className="step-title">{step.action || step.tool || 'Processing'}</div>
                </div>
                {step.input && (
                  <div style={{marginBottom:12}}>
                    <strong className={styles.tabletCentered} style={{color:'#667eea'}}>Input:</strong>
                    <div className="step-content">{typeof step.input === 'string' ? step.input : JSON.stringify(step.input, null, 2)}</div>
                  </div>
                )}
                {(step.output || step.observation) && (
                  <div>
                    <strong className={styles.tabletCentered} style={{color:'#48bb78'}}>Output:</strong>
                    <div className="step-content">
                      {/* Truncate long outputs on mobile */}
                      <span className={styles.desktopOnly}>
                        {((step.output || step.observation) + '').slice(0, 1000)}
                      </span>
                      <span className={styles.mobileOnly}>
                        {((step.output || step.observation) + '').slice(0, 300)}
                        {((step.output || step.observation) + '').length > 300 ? '...' : ''}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
