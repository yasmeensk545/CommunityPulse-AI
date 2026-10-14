import React from 'react';
import { getPriorityMeta, getStatusMeta } from '../../utils/formatters.js';

export function PriorityBadge({ priority, showScore = false, score = null }) {
  const meta = getPriorityMeta(priority);
  return (
    <span className={`badge ${meta.badgeClass}`} title={`Priority: ${meta.label}`}>
      <span className="badge-dot" style={{ backgroundColor: meta.dotColor }}></span>
      {meta.label}
      {showScore && score !== null && <span style={{ opacity: 0.8, fontSize: '0.7rem' }}>({score} pts)</span>}
    </span>
  );
}

export function StatusBadge({ status }) {
  const meta = getStatusMeta(status);
  return (
    <span className={`badge ${meta.badgeClass}`} title={`Status: ${meta.label}`}>
      <span className="badge-dot" style={{ backgroundColor: meta.dotColor }}></span>
      {meta.label}
    </span>
  );
}

export function CategoryBadge({ category }) {
  return (
    <span
      className="badge"
      style={{
        backgroundColor: '#F1F5F9',
        color: '#1E293B',
        border: '1px solid #CBD5E1',
        fontWeight: 500
      }}
    >
      {category}
    </span>
  );
}

export function AiSourceBadge({ source = '', isRealAi = false }) {
  const isGemini = isRealAi || source.toLowerCase().includes('gemini');
  return (
    <span
      className={`badge ${isGemini ? 'badge-ai-live' : 'badge-ai-fallback'}`}
      style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}
    >
      <span className="badge-dot" style={{ backgroundColor: isGemini ? '#16A34A' : '#0D9488' }}></span>
      {isGemini ? 'Google Gemini AI' : 'Explainable Rules Engine'}
    </span>
  );
}
