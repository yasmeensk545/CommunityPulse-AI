import React from 'react';
import { 
  AlertTriangle, 
  X, 
  MapPin, 
  Calendar, 
  ArrowRight
} from 'lucide-react';
import { StatusBadge, CategoryBadge } from './common/Badge.jsx';
import { formatRelativeTime, truncate } from '../utils/formatters.js';

export function DuplicateModal({
  isOpen,
  onClose,
  candidateReport,
  matchingReport,
  matchScore,
  matchReasons = [],
  onSubmitAnyway,
  onViewExisting
}) {
  if (!isOpen || !matchingReport) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-dialog modal-dialog-large" style={{ borderTop: '4px solid #EA580C' }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#FFEDD5',
                color: '#EA580C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <AlertTriangle size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 className="heading-2" style={{ color: '#9A3412' }}>
                  Potential Duplicate Report Detected
                </h3>
                <span
                  style={{
                    backgroundColor: matchScore >= 70 ? '#FEE2E2' : '#FFEDD5',
                    color: matchScore >= 70 ? '#991B1B' : '#9A3412',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.5rem',
                    borderRadius: '9999px',
                    border: '1px solid currentColor'
                  }}
                >
                  {matchScore}% Match Confidence
                </span>
              </div>
              <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '2px' }}>
                An existing civic incident in this neighborhood has already been logged.
              </p>
            </div>
          </div>

          <button onClick={onClose} className="btn btn-secondary btn-sm" aria-label="Close dialog">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Explanation Banner */}
          <div
            style={{
              padding: '0.85rem 1rem',
              borderRadius: '10px',
              backgroundColor: '#FFF7ED',
              border: '1px solid #FFEDD5',
              marginBottom: '1.25rem'
            }}
          >
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#9A3412', marginBottom: '0.35rem' }}>
              Why this was flagged:
            </h4>
            <ul style={{ paddingLeft: '1.2rem', fontSize: '0.8rem', color: '#7C2D12', lineHeight: 1.45 }}>
              {matchReasons.map((reason, idx) => (
                <li key={idx} style={{ marginBottom: '0.2rem' }}>{reason}</li>
              ))}
            </ul>
          </div>

          {/* Side by Side Comparison */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} id="duplicate-comparison-grid">
            {/* Left: New Candidate Report */}
            <div
              style={{
                padding: '1rem',
                borderRadius: '12px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #CBD5E1',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748B' }}>
                    Your New Submission
                  </span>
                  <CategoryBadge category={candidateReport.category} />
                </div>

                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.4rem' }}>
                  {candidateReport.title}
                </h4>

                <p style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.45, marginBottom: '0.75rem' }}>
                  {candidateReport.description}
                </p>
              </div>

              <div style={{ paddingTop: '0.5rem', borderTop: '1px dashed #CBD5E1', fontSize: '0.75rem', color: '#64748B' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <MapPin size={13} style={{ color: '#0D9488' }} />
                  <strong>{candidateReport.locality}</strong>
                </div>
              </div>
            </div>

            {/* Right: Existing Matching Report */}
            <div
              style={{
                padding: '1rem',
                borderRadius: '12px',
                backgroundColor: '#F0FDFA',
                border: '1px solid #99F6E4',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#0F766E' }}>
                      Existing Active Report
                    </span>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.75rem', color: '#0D9488' }}>
                      #{matchingReport.id}
                    </span>
                  </div>
                  <StatusBadge status={matchingReport.status} />
                </div>

                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.4rem' }}>
                  {matchingReport.title}
                </h4>

                <p style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.45, marginBottom: '0.75rem' }}>
                  {truncate(matchingReport.description, 150)}
                </p>

                {matchingReport.aiAnalysis?.department && (
                  <div style={{ fontSize: '0.73rem', color: '#0F766E', marginBottom: '0.5rem' }}>
                    Assigned: <strong>{matchingReport.aiAnalysis.department}</strong>
                  </div>
                )}
              </div>

              <div style={{ paddingTop: '0.5rem', borderTop: '1px dashed #99F6E4', fontSize: '0.75rem', color: '#64748B', display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <MapPin size={13} style={{ color: '#0D9488' }} />
                  <span>{matchingReport.locality}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Calendar size={12} />
                  <span>{formatRelativeTime(matchingReport.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Policy clarification */}
          <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: '1rem', textAlign: 'center' }}>
            To prevent municipal queue congestion, you may cancel submission and track the existing ticket, or submit as a distinct report if this is an independent issue.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <button
            onClick={() => {
              onClose();
              onViewExisting(matchingReport);
            }}
            className="btn btn-secondary"
          >
            <span>Cancel & View Existing #{matchingReport.id}</span>
          </button>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={onClose} className="btn btn-secondary btn-sm">
              Keep Editing
            </button>
            <button
              onClick={onSubmitAnyway}
              className="btn btn-primary btn-sm"
              style={{ backgroundColor: '#EA580C' }}
            >
              <span>Submit Anyway as Distinct Issue</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        <style>{`
          @media (max-width: 640px) {
            #duplicate-comparison-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
