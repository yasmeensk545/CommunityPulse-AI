import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Calendar, 
  User, 
  Building, 
  Sparkles, 
  CheckCircle2, 
  Send, 
  Trash2, 
  AlertCircle,
  Users
} from 'lucide-react';
import { VALID_STATUSES } from '../services/storage.js';
import { PriorityBadge, StatusBadge, CategoryBadge, AiSourceBadge } from './common/Badge.jsx';
import { formatFullDate, formatRelativeTime } from '../utils/formatters.js';

export function IssueDetailModal({
  report,
  isOpen,
  onClose,
  onStatusChange,
  onAddNote,
  onDeleteReport
}) {
  const [newNote, setNewNote] = useState('');
  const [noteAuthor, setNoteAuthor] = useState('Municipal Officer');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!isOpen || !report) return null;

  const handleAddNoteSubmit = (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setIsSubmittingNote(true);
    onAddNote(report.id, newNote.trim(), noteAuthor.trim() || 'Municipal Staff');
    setNewNote('');
    setIsSubmittingNote(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-dialog modal-dialog-large">
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#0D9488', fontSize: '0.95rem' }}>
              #{report.id}
            </span>
            <CategoryBadge category={report.category} />
            <PriorityBadge priority={report.priority} showScore={true} score={report.priorityScore} />
            <StatusBadge status={report.status} />
            {report.isSample && <span className="badge badge-sample">Sample Data</span>}
          </div>

          <button onClick={onClose} className="btn btn-secondary btn-sm" aria-label="Close dialog">
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Title & Core Location */}
          <div>
            <h2 className="heading-1" style={{ fontSize: '1.4rem', color: '#0F172A', marginBottom: '0.4rem' }}>
              {report.title}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.8rem', color: '#64748B' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <MapPin size={14} style={{ color: '#0D9488' }} />
                <strong style={{ color: '#334155' }}>{report.locality}</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Calendar size={14} />
                <span>Filed {formatFullDate(report.createdAt)} ({formatRelativeTime(report.createdAt)})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <User size={14} />
                <span>By {report.reportedBy || 'Local Resident'}</span>
              </div>
              {report.affectedEstimate && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Users size={14} />
                  <span>Impact: {report.affectedEstimate}</span>
                </div>
              )}
            </div>
          </div>

          {/* Operational Status Workflow Switcher */}
          <div
            style={{
              padding: '1rem',
              borderRadius: '12px',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#475569' }}>
                Operational Status Workflow
              </span>
              <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                Current: <strong style={{ color: '#0F172A' }}>{report.status}</strong>
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }} id="status-buttons-grid">
              {VALID_STATUSES.map((status) => {
                const isCurrent = report.status === status;
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => onStatusChange(report.id, status)}
                    className="btn btn-sm"
                    style={{
                      backgroundColor: isCurrent ? '#0D9488' : '#FFFFFF',
                      color: isCurrent ? '#FFFFFF' : '#334155',
                      border: isCurrent ? '1px solid #0F766E' : '1px solid #CBD5E1',
                      fontWeight: isCurrent ? 700 : 500,
                      fontSize: '0.78rem',
                      padding: '0.5rem 0.25rem',
                      textAlign: 'center',
                      justifyContent: 'center',
                      boxShadow: isCurrent ? '0 2px 4px rgba(13, 148, 136, 0.2)' : 'none'
                    }}
                  >
                    {isCurrent && <CheckCircle2 size={13} />}
                    <span>{status}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description Text */}
          <div className="cp-card">
            <h3 className="heading-3" style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: '#334155' }}>
              Citizen Incident Description
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#1E293B', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {report.description}
            </p>

            {/* Photo preview if present */}
            {report.imageUrl && (
              <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', display: 'block', marginBottom: '0.4rem' }}>
                  Attached Photographic Evidence
                </span>
                <img
                  src={report.imageUrl}
                  alt="Incident evidence"
                  style={{ maxHeight: '220px', borderRadius: '8px', border: '1px solid #E2E8F0', objectFit: 'contain' }}
                />
              </div>
            )}
          </div>

          {/* AI Decision Support & Triage Card */}
          {report.aiAnalysis && (
            <div
              style={{
                borderRadius: '12px',
                backgroundColor: '#F0FDFA',
                border: '1px solid #99F6E4',
                padding: '1.2rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <Sparkles size={17} style={{ color: '#0D9488' }} />
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F766E' }}>
                    AI Decision Support & Triage Analysis
                  </h3>
                </div>
                <AiSourceBadge source={report.aiAnalysis.source} isRealAi={report.aiAnalysis.isRealAi} />
              </div>

              {/* Department & Recommendation */}
              <div style={{ backgroundColor: '#FFFFFF', padding: '0.85rem', borderRadius: '10px', border: '1px solid #CCFBF1', marginBottom: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#0F766E', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  <Building size={15} />
                  <span>Assigned Jurisdiction: {report.aiAnalysis.department}</span>
                </div>
                <p style={{ color: '#0F172A', fontSize: '0.825rem', fontWeight: 600, lineHeight: 1.4 }}>
                  Action Protocol: <span style={{ fontWeight: 400 }}>{report.aiAnalysis.recommendedAction}</span>
                </p>
                <p style={{ color: '#475569', fontSize: '0.78rem', marginTop: '0.35rem', lineHeight: 1.4 }}>
                  <strong>Operational Rationale:</strong> {report.aiAnalysis.explanation}
                </p>
              </div>

              {/* Safety & Environmental Breakdown */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }} id="detail-hazards-split">
                <div style={{ padding: '0.65rem 0.85rem', borderRadius: '8px', backgroundColor: '#FEF2F2', border: '1px solid #FEE2E2', fontSize: '0.78rem', color: '#991B1B' }}>
                  <strong>Safety Hazard Assessment:</strong>
                  <p style={{ marginTop: '0.2rem', color: '#7F1D1D' }}>{report.aiAnalysis.safetyConcerns}</p>
                </div>
                <div style={{ padding: '0.65rem 0.85rem', borderRadius: '8px', backgroundColor: '#F0FDF4', border: '1px solid #DCFCE7', fontSize: '0.78rem', color: '#166534' }}>
                  <strong>Environmental Impact:</strong>
                  <p style={{ marginTop: '0.2rem', color: '#14532D' }}>{report.aiAnalysis.environmentalConcerns}</p>
                </div>
              </div>

              {/* Factor Breakdown (if available) */}
              {report.aiAnalysis.factorBreakdown?.length > 0 && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <h4 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#0F766E', marginBottom: '0.4rem' }}>
                    Transparent Scoring Breakdown ({report.priorityScore}/100)
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.4rem' }}>
                    {report.aiAnalysis.factorBreakdown.map((f, i) => (
                      <div key={i} style={{ padding: '0.4rem 0.6rem', borderRadius: '6px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', fontSize: '0.72rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, color: '#334155' }}>
                          <span>{f.factor}</span>
                          <span style={{ color: '#0D9488' }}>{f.points}/{f.max} pts</span>
                        </div>
                        <p className="text-muted" style={{ fontSize: '0.68rem', marginTop: '2px' }}>{f.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Human in the loop disclaimer */}
              <div style={{ fontSize: '0.72rem', color: '#64748B', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <AlertCircle size={13} style={{ color: '#0D9488', flexShrink: 0 }} />
                <span>Human Review Required: AI recommendations serve as municipal advisory triage. Physical dispatches require supervisory signoff.</span>
              </div>
            </div>
          )}

          {/* Resolution & Inspection History */}
          <div className="cp-card">
            <h3 className="heading-3" style={{ fontSize: '0.95rem', marginBottom: '0.85rem', color: '#0F172A' }}>
              Resolution Notes & Field Updates ({report.resolutionNotes?.length || 0})
            </h3>

            {/* Existing notes list */}
            {(!report.resolutionNotes || report.resolutionNotes.length === 0) ? (
              <p className="text-muted" style={{ fontSize: '0.8rem', padding: '0.75rem 0', textAlign: 'center' }}>
                No inspection or resolution notes logged yet. Add the first update below.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
                {report.resolutionNotes.map(note => (
                  <div
                    key={note.id}
                    style={{
                      padding: '0.75rem 0.9rem',
                      borderRadius: '8px',
                      backgroundColor: '#F8FAFC',
                      borderLeft: '3px solid #0D9488',
                      fontSize: '0.8rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                      <strong style={{ color: '#0F172A' }}>{note.author}</strong>
                      <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                        {formatFullDate(note.timestamp)} ({formatRelativeTime(note.timestamp)})
                      </span>
                    </div>
                    <p style={{ color: '#334155', lineHeight: 1.45 }}>{note.text}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Add note form */}
            <form onSubmit={handleAddNoteSubmit} style={{ marginTop: '0.85rem', paddingTop: '0.85rem', borderTop: '1px solid var(--border-light)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="Officer / Inspector Name"
                  value={noteAuthor}
                  onChange={(e) => setNoteAuthor(e.target.value)}
                  className="form-input"
                  style={{ height: '36px', fontSize: '0.8rem' }}
                />
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="Enter dispatch notes, crew arrival, or repair progress..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="form-input"
                    style={{ height: '36px', fontSize: '0.8rem', flex: 1 }}
                  />
                  <button
                    type="submit"
                    disabled={!newNote.trim() || isSubmittingNote}
                    className="btn btn-primary btn-sm"
                    style={{ height: '36px', padding: '0 0.9rem' }}
                  >
                    <Send size={14} />
                    <span>Post Note</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <div>
            {showDeleteConfirm ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.78rem', color: '#991B1B', fontWeight: 600 }}>Confirm delete?</span>
                <button
                  onClick={() => {
                    onDeleteReport(report.id);
                    onClose();
                  }}
                  className="btn btn-danger btn-sm"
                >
                  Yes, Delete Report
                </button>
                <button onClick={() => setShowDeleteConfirm(false)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="btn btn-secondary btn-sm"
                style={{ color: '#DC2626', borderColor: '#FCA5A5' }}
              >
                <Trash2 size={13} />
                <span>Delete Ticket</span>
              </button>
            )}
          </div>

          <button onClick={onClose} className="btn btn-secondary">
            Close View
          </button>
        </div>

        <style>{`
          @media (max-width: 640px) {
            #status-buttons-grid {
              grid-template-columns: repeat(2, 1fr) !important;
            }
            #detail-hazards-split {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
