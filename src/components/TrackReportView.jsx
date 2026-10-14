import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  Wrench, 
  ShieldCheck, 
  AlertCircle, 
  Building,
  Info
} from 'lucide-react';
import { PriorityBadge, CategoryBadge } from './common/Badge.jsx';
import { formatFullDate, formatRelativeTime } from '../utils/formatters.js';

const STATUS_STEPS = [
  { key: 'Reported', label: '1. Reported', icon: Clock, desc: 'Report logged & received' },
  { key: 'Under Review', label: '2. Under Review', icon: ShieldCheck, desc: 'City team reviewing' },
  { key: 'In Progress', label: '3. In Progress', icon: Wrench, desc: 'Crew actively fixing' },
  { key: 'Resolved', label: '4. Resolved', icon: CheckCircle2, desc: 'Problem fixed' }
];

export function TrackReportView({ reports = [], initialReportId = '' }) {
  const [searchQuery, setSearchQuery] = useState(initialReportId || '');
  const [activeReport, setActiveReport] = useState(() => {
    if (initialReportId) {
      return reports.find(r => r.id.toLowerCase() === initialReportId.toLowerCase()) || reports[0] || null;
    }
    return reports[0] || null;
  });

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    if (!query) return;

    const matched = reports.find(r => 
      r.id.toLowerCase() === query ||
      r.id.toLowerCase().replace(/[^a-z0-9]/g, '') === query.replace(/[^a-z0-9]/g, '') ||
      r.title.toLowerCase().includes(query) ||
      r.locality.toLowerCase().includes(query)
    );

    if (matched) {
      setActiveReport(matched);
    } else {
      setActiveReport('NOT_FOUND');
    }
  };

  const getStepIndex = (status) => {
    switch (status) {
      case 'Resolved': return 3;
      case 'In Progress': return 2;
      case 'Under Review': return 1;
      case 'Reported':
      default: return 0;
    }
  };

  const currentStepIdx = activeReport && activeReport !== 'NOT_FOUND' ? getStepIndex(activeReport.status) : 0;

  const getStatusExplanation = (status) => {
    switch (status) {
      case 'Resolved':
        return {
          title: 'Problem Successfully Fixed',
          desc: 'The reported hazard has been repaired, cleaned, or restored by city field technicians and marked completed.',
          next: 'No further action required. Thank you for helping keep our community safe and clean!'
        };
      case 'In Progress':
        return {
          title: 'Repair Actively Underway',
          desc: 'A dedicated municipal field crew is on site or scheduled with materials to perform active repairs.',
          next: 'Technicians will post inspection notes once the repair is finalized.'
        };
      case 'Under Review':
        return {
          title: 'City Coordinator Reviewing',
          desc: 'Your report has been examined by city dispatch. Priority and department routing have been verified.',
          next: 'A field inspection crew is being scheduled for on-site assessment.'
        };
      case 'Reported':
      default:
        return {
          title: 'Report Received',
          desc: 'Your report has been safely logged in the community database with an initial priority assessment.',
          next: 'The responsible municipal agency will review this ticket shortly.'
        };
    }
  };

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto' }}>
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 className="heading-1" style={{ fontSize: '1.9rem', marginBottom: '0.4rem' }}>
          Track a Community Report
        </h1>
        <p className="text-muted" style={{ fontSize: '0.95rem' }}>
          Enter your Report ID to check repair progress and see current status.
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: '#94A3B8' }} />
            <input
              type="text"
              placeholder="Enter Report ID (e.g. CP-801, CP-802) or street name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '40px', height: '48px', fontSize: '0.95rem', borderRadius: '12px' }}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ height: '48px', padding: '0 1.5rem', borderRadius: '12px', fontSize: '0.95rem', fontWeight: 600 }}
          >
            Track Report
          </button>
        </div>

        {/* Quick Sample Suggestions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap', fontSize: '0.78rem' }}>
          <span className="text-muted">Try clicking:</span>
          {reports.slice(0, 3).map(r => (
            <button
              key={r.id}
              type="button"
              onClick={() => {
                setSearchQuery(r.id);
                setActiveReport(r);
              }}
              style={{
                backgroundColor: '#F1F5F9',
                color: '#0F766E',
                border: '1px solid #CBD5E1',
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

      {/* Not Found State */}
      {activeReport === 'NOT_FOUND' && (
        <div className="cp-card" style={{ textAlign: 'center', padding: '3rem 1.5rem', borderRadius: '16px' }}>
          <AlertCircle size={40} style={{ color: '#EA580C', margin: '0 auto 0.75rem' }} />
          <h3 className="heading-2" style={{ color: '#9A3412' }}>Report Not Found</h3>
          <p className="text-muted" style={{ fontSize: '0.875rem', marginTop: '0.4rem', maxWidth: '400px', margin: '0.4rem auto 1.25rem' }}>
            We could not find a report matching "{searchQuery}". Check your ID number or select one from the recent list below.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            {reports.slice(0, 3).map(r => (
              <button
                key={r.id}
                onClick={() => {
                  setSearchQuery(r.id);
                  setActiveReport(r);
                }}
                className="btn btn-secondary btn-sm"
              >
                Track #{r.id}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Active Report Tracker Card */}
      {activeReport && activeReport !== 'NOT_FOUND' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="cp-card" style={{ padding: '1.75rem' }}>
            {/* Header info */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#0D9488', fontSize: '1.1rem' }}>
                  #{activeReport.id}
                </span>
                <CategoryBadge category={activeReport.category} />
                <PriorityBadge priority={activeReport.priority} />
              </div>
              <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                Filed {formatRelativeTime(activeReport.createdAt)}
              </span>
            </div>

            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.4rem' }}>
              {activeReport.title}
            </h2>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', color: '#475569', marginBottom: '1.5rem' }}>
              <MapPin size={15} style={{ color: '#0D9488' }} />
              <strong style={{ color: '#1E293B' }}>{activeReport.locality}</strong>
            </div>

            {/* Visual 4-Step Progress Stepper */}
            <div style={{ margin: '2rem 0 2.5rem' }}>
              <div className="tracking-stepper">
                {/* Connecting Line */}
                <div className="tracking-stepper-line">
                  <div
                    className="tracking-stepper-fill"
                    style={{ width: `${(currentStepIdx / (STATUS_STEPS.length - 1)) * 100}%` }}
                  />
                </div>

                {STATUS_STEPS.map((step, idx) => {
                  const isCompleted = idx <= currentStepIdx;
                  const isCurrent = idx === currentStepIdx;
                  const StepIcon = step.icon;

                  return (
                    <div
                      key={step.key}
                      className={`tracking-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
                    >
                      <div className="tracking-step-circle">
                        <StepIcon size={18} />
                      </div>
                      <span className="tracking-step-label">
                        {step.key}
                      </span>
                      <span className="text-muted" style={{ fontSize: '0.7rem', marginTop: '2px', display: 'none' }} id={`step-desc-${idx}`}>
                        {step.desc}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Current Status Callout */}
            {(() => {
              const info = getStatusExplanation(activeReport.status);
              return (
                <div
                  style={{
                    backgroundColor: activeReport.status === 'Resolved' ? '#F0FDF4' : '#F0FDFA',
                    border: `1px solid ${activeReport.status === 'Resolved' ? '#DCFCE7' : '#CCFBF1'}`,
                    borderRadius: '12px',
                    padding: '1.25rem',
                    marginBottom: '1.25rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <span style={{ fontWeight: 800, fontSize: '1rem', color: activeReport.status === 'Resolved' ? '#166534' : '#0F766E' }}>
                      Status: {activeReport.status}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: '#1E293B', lineHeight: 1.5, marginBottom: '0.65rem' }}>
                    {info.desc}
                  </p>
                  <div style={{ fontSize: '0.8rem', color: '#0F766E', fontWeight: 600 }}>
                    Next Step: <span style={{ fontWeight: 400, color: '#334155' }}>{info.next}</span>
                  </div>
                </div>
              );
            })()}

            {/* Assigned Department */}
            {activeReport.aiAnalysis?.department && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.825rem', color: '#475569', marginBottom: '1rem' }}>
                <Building size={16} style={{ color: '#0D9488' }} />
                <span>Assigned City Department: <strong style={{ color: '#0F172A' }}>{activeReport.aiAnalysis.department}</strong></span>
              </div>
            )}

            {/* Field Crew Inspection Updates */}
            {activeReport.resolutionNotes?.length > 0 && (
              <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-light)' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.65rem' }}>
                  Latest Field Updates ({activeReport.resolutionNotes.length})
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {activeReport.resolutionNotes.map(n => (
                    <div
                      key={n.id}
                      style={{
                        padding: '0.75rem 0.9rem',
                        borderRadius: '8px',
                        backgroundColor: '#F8FAFC',
                        borderLeft: '3px solid #0D9488',
                        fontSize: '0.8rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                        <strong style={{ color: '#0F172A' }}>{n.author}</strong>
                        <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                          {formatFullDate(n.timestamp)}
                        </span>
                      </div>
                      <p style={{ color: '#334155' }}>"{n.text}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Friendly Demo Disclaimer */}
          <div
            style={{
              padding: '0.85rem 1rem',
              borderRadius: '10px',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              fontSize: '0.78rem',
              color: '#64748B'
            }}
          >
            <Info size={16} style={{ color: '#0D9488', flexShrink: 0 }} />
            <span>
              <strong>Demonstration Notice:</strong> CommunityPulse AI updates status in this interactive prototype. In a live municipal deployment, citizens receive instant SMS and email tracking links upon dispatch.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
