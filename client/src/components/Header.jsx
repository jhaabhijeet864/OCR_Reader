import React from 'react';
import styles from './components.module.css';

/**
 * Simple header component. Kept intentionally small and stateless for reuse.
 * Enhanced with responsive design improvements
 */
export default function Header() {
  return (
    <header className="header fade-in">
      <h1 className="header-title">Finance AI Workspace</h1>
      <p className="header-subtitle">Intelligent document analysis with multi‑tool AI reasoning</p>
      <div className="feature-badges">
        <span className="badge" role="presentation">🧠 Smart Agent</span>
        <span className={`badge ${styles.mobileOnly}`} role="presentation">📄 Docs</span>
        <span className={`badge ${styles.desktopOnly}`} role="presentation">📄 Document Search</span>
        <span className="badge" role="presentation">💱 Currency Converter</span>
        <span className={`badge ${styles.desktopOnly}`} role="presentation">⚡ Real-time Processing</span>
      </div>
    </header>
  );
}
