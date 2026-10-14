import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  Wrench, 
  AlertCircle, 
  Building2, 
  MessageSquare
} from 'lucide-react';
import { CategoryBadge, StatusBadge } from './common/Badge.jsx';
import { formatFullDate } from '../utils/formatters.js';

export function TrackReportView({ reports = [], initialReportId = '' }) {
  const [searchQuery, setSearchQuery] = useState(initialReportId || '');
  const [searchedReport, setSearchedReport] = useState(() => {
    if (initialReportId) {
      const q = initialReportId.trim().toUpperCase();
      return reports.find(r => r.id.toUpperCase() === q || (r.legacyId && r.legacyId.toUpperCase() === q)) || null;
    }
    // Default to the first report for instant demonstration
    return reports[0] || null;
  });
  const [notFound, setNotFound] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim().toUpperCase();
    if (!q) return;

    const matched = reports.find(r => 
      r.id.toUpperCase() === q || 
      (r.legacyId && r.legacyId.toUpperCase() === q) ||
      r.id.toUpperCase().replace(/[^A-Z0-9]/g, '') === q.replace(/[^A-Z0-9]/g, '')
    );

    if (matched) {
      setSearchedReport(matched);
      setNotFound(false);
    } else {
      setSearchedReport(null);
      setNotFound(true);
    }
  };

  const getStatusStepIndex = (status) => {
    switch (status) {
      case 'Resolved': return 2;
      case 'In Progress': return 1;
      case 'Pending':
      default: return 0;
    }
  };

  const stepIndex = searchedReport ? getStatusStepIndex(searchedReport.status) : 0;

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Title */}
      <div style={{ textAlign: 'center' }}>
        <h1 className="heading-1" style={{ fontSize: '1.9rem', color: '#0F172A', marginBottom: '0.4rem' }}>
          Track Your Report
        </h1>
        <p className="text-muted" style={{ fontSize: '0.92rem' }}>
          Check the current progress and municipal updates for your community ticket.
        </p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleSearch}>
        <div style={{ display: 'flex', gap: '0.5rem', maxWidth: '640px', margin: '0 auto' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '15px', color: '#94A3B8' }} />
            <input
              type="text"
              placeholder="e.g. CP-2026-80124"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (notFound) setNotFound(false);
              }}
              className="form-input"
              style={{ paddingLeft: '42px', height: '48px', fontSize: '0.95rem', borderRadius: '12px' }}
              aria-label="Enter Report ID"
              id="track-report-id-input"
            />
          </div>
          <button
            type="submit"
            className="btn btn-blue"
            style={{ height: '48px', padding: '0 1.6rem', borderRadius: '12px', fontSize: '0.95rem', fontWeight: 600 }}
            id="track-report-submit-btn"
          >
            Track Status
          </button>
        </div>

        {/* Quick Sample IDs */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap', fontSize: '0.78rem' }}>
          <span className="text-muted">Sample Tickets:</span>
          {reports.slice(0, 4).map(r => (
            <button
              key={r.id}
              type="button"
              onClick={() => {
                setSearchQuery(r.id);
                setSearchedReport(r);
                setNotFound(false);
              }}
              style={{
                backgroundColor: '#EFF6FF',
                color: '#2563EB',
                border: '1px solid #BFDBFE',
                padding: '0.2rem 0.55rem',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '0.75rem'
              }}
            >
              #{r.id} ({r.category})
            </button>
          ))}
        </div>
      </form>

      {/* NOT FOUND SCREEN */}
      {notFound && (
        <div
          className="cp-card"
          style={{
            textAlign: 'center',
            padding: '2.5rem 1.5rem',
            borderRadius: '16px',
            backgroundColor: '#FEF2F2',
            border: '1px solid #FCA5A5'
          }}
        >
          <AlertCircle size={36} style={{ color: '#DC2626', margin: '0 auto 0.75rem' }} />
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#991B1B', marginBottom: '0.35rem' }}>
            Report not found. Check your Report ID and try again.
          </h2>
          <p style={{ fontSize: '0.82rem', color: '#7F1D1D', maxWidth: '420px', margin: '0 auto' }}>
            Please verify the exact ticket number (e.g. <code>CP-2026-80124</code>) received when filing your community report.
          </p>
        </div>
      )}

      {/* PUBLIC REPORT DETAILS CARD */}
      {searchedReport && !notFound && (
        <div
          className="cp-card"
          style={{
            borderRadius: '18px',
            padding: '2rem',
            boxShadow: 'var(--shadow-md)',
            borderTop: '5px solid #2563EB'
          }}
          id="public-report-result-card"
        >
          {/* Header Row: ID, Category & Date */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              paddingBottom: '1.25rem',
              borderBottom: '1px solid var(--border-light)'
            }}
          >
            <div>
              <span style={{ fontSize: '0.78rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700 }}>
                Community Ticket
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginTop: '0.2rem' }}>
                <span
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    fontFamily: 'monospace',
                    color: '#2563EB',
                    letterSpacing: '0.02em'
                  }}
                >
                  {searchedReport.id}
                </span>
                <CategoryBadge category={searchedReport.category} />
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <StatusBadge status={searchedReport.status} />
              <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', marginTop: '0.35rem' }}>
                Submitted: {formatFullDate(searchedReport.createdAt)}
              </span>
            </div>
          </div>

          {/* 3-Step Public Status Timeline */}
          <div style={{ margin: '1.75rem 0' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '1.25rem' }}>
              Progress Timeline
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', position: 'relative' }}>
              {/* Step 1: Pending */}
              <div
                style={{
                  padding: '1rem',
                  borderRadius: '12px',
                  backgroundColor: stepIndex >= 0 ? '#FEF3C7' : '#F8FAFC',
                  border: stepIndex >= 0 ? '2px solid #FCD34D' : '1px solid var(--border-light)',
                  textAlign: 'center'
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: stepIndex >= 0 ? '#D97706' : '#CBD5E1',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 0.5rem'
                  }}
                >
                  <Clock size={16} />
                </div>
                <strong style={{ fontSize: '0.85rem', color: '#92400E', display: 'block' }}>
                  1. Pending
                </strong>
                <span style={{ fontSize: '0.74rem', color: '#78350F' }}>
                  Logged & queued for dispatch
                </span>
              </div>

              {/* Step 2: In Progress */}
              <div
                style={{
                  padding: '1rem',
                  borderRadius: '12px',
                  backgroundColor: stepIndex >= 1 ? '#DBEAFE' : '#F8FAFC',
                  border: stepIndex >= 1 ? '2px solid #93C5FD' : '1px solid var(--border-light)',
                  textAlign: 'center'
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: stepIndex >= 1 ? '#2563EB' : '#CBD5E1',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 0.5rem'
                  }}
                >
                  <Wrench size={16} />
                </div>
                <strong style={{ fontSize: '0.85rem', color: stepIndex >= 1 ? '#1E40AF' : '#64748B', display: 'block' }}>
                  2. In Progress
                </strong>
                <span style={{ fontSize: '0.74rem', color: stepIndex >= 1 ? '#1E3A8A' : '#94A3B8' }}>
                  Crew on-site or scheduled
                </span>
              </div>

              {/* Step 3: Resolved */}
              <div
                style={{
                  padding: '1rem',
                  borderRadius: '12px',
                  backgroundColor: stepIndex >= 2 ? '#DCFCE7' : '#F8FAFC',
                  border: stepIndex >= 2 ? '2px solid #86EFAC' : '1px solid var(--border-light)',
                  textAlign: 'center'
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: stepIndex >= 2 ? '#16A34A' : '#CBD5E1',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 0.5rem'
                  }}
                >
                  <CheckCircle2 size={16} />
                </div>
                <strong style={{ fontSize: '0.85rem', color: stepIndex >= 2 ? '#166534' : '#64748B', display: 'block' }}>
                  3. Resolved
                </strong>
                <span style={{ fontSize: '0.74rem', color: stepIndex >= 2 ? '#14532D' : '#94A3B8' }}>
                  Completed and inspected
                </span>
              </div>
            </div>
          </div>

          {/* Public Info Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.25rem' }}>
            {/* Title & Description */}
            <div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.35rem' }}>
                {searchedReport.title}
              </h4>
              <p style={{ fontSize: '0.875rem', color: '#334155', lineHeight: 1.5 }}>
                {searchedReport.description}
              </p>
            </div>

            {/* Location & Department */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={18} style={{ color: '#0D9488', flexShrink: 0 }} />
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>
                    Reported Location
                  </span>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0F172A' }}>
                    {searchedReport.locality}
                  </div>
                  {searchedReport.ward && (
                    <div style={{ fontSize: '0.74rem', color: '#475569' }}>{searchedReport.ward}</div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building2 size={18} style={{ color: '#2563EB', flexShrink: 0 }} />
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>
                    Assigned Department
                  </span>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0F172A' }}>
                    {searchedReport.aiAnalysis?.department || 'Municipal Services Division'}
                  </div>
                </div>
              </div>
            </div>

            {/* Citizen Public Note (CRITICAL: Displays ONLY publicNote, never internalNotes) */}
            <div className="public-note-section" style={{ marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
                <MessageSquare size={16} style={{ color: '#2563EB' }} />
                <strong style={{ fontSize: '0.85rem', color: '#1E40AF' }}>
                  Municipal Crew Public Update:
                </strong>
              </div>

              {searchedReport.publicNote ? (
                <p style={{ fontSize: '0.85rem', color: '#1E3A8A', lineHeight: 1.5, margin: 0 }}>
                  {searchedReport.publicNote}
                </p>
              ) : (
                <p style={{ fontSize: '0.82rem', color: '#475569', fontStyle: 'italic', margin: 0 }}>
                  Your report has been received and queued for department dispatch. Check back soon for on-site crew updates.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
