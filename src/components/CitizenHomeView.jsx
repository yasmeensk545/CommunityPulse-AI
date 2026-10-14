import React from 'react';
import { 
  Plus, 
  Search, 
  Clock, 
  Wrench, 
  CheckCircle2, 
  MapPin, 
  ArrowRight,
  Sparkles,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';
import { PriorityBadge, StatusBadge, CategoryBadge } from './common/Badge.jsx';
import { formatRelativeTime, truncate } from '../utils/formatters.js';

export function CitizenHomeView({
  reports = [],
  onOpenReportModal,
  onNavigateToTrack,
  onSelectReport,
  onViewAllReports
}) {
  // Simple counts for ordinary citizens
  const reportedCount = reports.filter(r => r.status === 'Reported').length;
  const inProgressCount = reports.filter(r => r.status === 'In Progress' || r.status === 'Under Review').length;
  const resolvedCount = reports.filter(r => r.status === 'Resolved').length;

  // Recent 4 reports for the home feed
  const recentReports = [...reports]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4);

  // Critical safety count
  const criticalCount = reports.filter(r => r.priority === 'Critical' && r.status !== 'Resolved').length;

  return (
    <div>
      {/* 1. Welcoming Citizen Hero */}
      <section className="citizen-hero">
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.3rem 0.85rem',
            borderRadius: '9999px',
            backgroundColor: '#CCFBF1',
            color: '#0F766E',
            fontSize: '0.78rem',
            fontWeight: 700,
            marginBottom: '1rem',
            letterSpacing: '0.02em'
          }}
        >
          <Sparkles size={14} />
          <span>Smart Neighbourhood Assistant</span>
        </span>

        <h1 className="citizen-hero-title">
          Make Your Community Better
        </h1>

        <p className="citizen-hero-subtitle">
          Report local problems. Help make your neighbourhood safer and cleaner.
        </p>

        <div className="citizen-hero-actions">
          <button
            onClick={onOpenReportModal}
            className="btn btn-primary btn-lg"
            style={{ fontSize: '1.05rem', padding: '0.9rem 1.8rem', borderRadius: '12px' }}
            id="hero-report-problem-btn"
          >
            <Plus size={20} />
            <span>Report a Problem</span>
          </button>

          <button
            onClick={onNavigateToTrack}
            className="btn btn-secondary btn-lg"
            style={{ fontSize: '1.05rem', padding: '0.9rem 1.6rem', borderRadius: '12px' }}
            id="hero-track-report-btn"
          >
            <Search size={18} />
            <span>Track a Report</span>
          </button>
        </div>
      </section>

      {/* 2. Urgent Community Safety Alert Banner (if any) */}
      {criticalCount > 0 && (
        <div
          style={{
            backgroundColor: '#FEF2F2',
            border: '1px solid #FCA5A5',
            borderRadius: '14px',
            padding: '0.9rem 1.25rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#DC2626',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <ShieldAlert size={20} />
            </div>
            <div>
              <p style={{ fontWeight: 700, color: '#991B1B', fontSize: '0.9rem' }}>
                {criticalCount} urgent safety issue{criticalCount > 1 ? 's' : ''} reported in our area
              </p>
              <p style={{ color: '#7F1D1D', fontSize: '0.78rem' }}>
                City emergency teams have been alerted for priority repair.
              </p>
            </div>
          </div>
          <button
            onClick={onViewAllReports}
            className="btn btn-sm"
            style={{ backgroundColor: '#991B1B', color: '#FFFFFF', fontWeight: 600, fontSize: '0.78rem' }}
          >
            <span>See Urgent Issues</span>
            <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* 3. Three Simple Summary Cards */}
      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', marginBottom: '1rem' }}>
          Community Status at a Glance
        </h2>

        <div className="citizen-summary-grid">
          {/* Card 1: Reported */}
          <div
            className="cp-card cp-card-interactive"
            onClick={onViewAllReports}
            style={{
              padding: '1.4rem',
              borderTop: '4px solid #64748B',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Reported
                </span>
                <h3 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0F172A', marginTop: '0.2rem' }}>
                  {reportedCount}
                </h3>
              </div>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: '#F1F5F9',
                  color: '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Clock size={22} />
              </div>
            </div>
            <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '0.75rem' }}>
              Newly submitted by neighbours and awaiting review.
            </p>
          </div>

          {/* Card 2: In Progress */}
          <div
            className="cp-card cp-card-interactive"
            onClick={onViewAllReports}
            style={{
              padding: '1.4rem',
              borderTop: '4px solid #4F46E5',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4F46E5', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  In Progress
                </span>
                <h3 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0F172A', marginTop: '0.2rem' }}>
                  {inProgressCount}
                </h3>
              </div>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: '#EEF2FF',
                  color: '#4F46E5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Wrench size={22} />
              </div>
            </div>
            <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '0.75rem' }}>
              Being inspected or actively fixed by city work crews.
            </p>
          </div>

          {/* Card 3: Resolved */}
          <div
            className="cp-card cp-card-interactive"
            onClick={onViewAllReports}
            style={{
              padding: '1.4rem',
              borderTop: '4px solid #16A34A',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#16A34A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Resolved
                </span>
                <h3 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0F172A', marginTop: '0.2rem' }}>
                  {resolvedCount}
                </h3>
              </div>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: '#F0FDF4',
                  color: '#16A34A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <CheckCircle2 size={22} />
              </div>
            </div>
            <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '0.75rem' }}>
              Problems successfully resolved in our community.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Three Simple Steps Explainer */}
      <section style={{ marginBottom: '2.5rem' }}>
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--border-light)',
            borderRadius: '16px',
            padding: '1.5rem 1.75rem'
          }}
        >
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', marginBottom: '1.25rem', textAlign: 'center' }}>
            How CommunityPulse Works in 3 Easy Steps
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '0.85rem' }}>
              <span
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#F0FDFA',
                  color: '#0D9488',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                1
              </span>
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A' }}>Report It Fast</h3>
                <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '0.25rem', lineHeight: 1.45 }}>
                  Tell us what is broken, where it is, and snap an optional photo.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.85rem' }}>
              <span
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#F0FDFA',
                  color: '#0D9488',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                2
              </span>
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A' }}>AI Prioritization</h3>
                <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '0.25rem', lineHeight: 1.45 }}>
                  Our AI helper assesses urgency and routes the issue to the right city department.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.85rem' }}>
              <span
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#F0FDFA',
                  color: '#0D9488',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                3
              </span>
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A' }}>Track Progress</h3>
                <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '0.25rem', lineHeight: 1.45 }}>
                  Follow the repair from review to resolution with real status updates.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Recent Community Reports */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F172A' }}>
              Recent Community Reports
            </h2>
            <p className="text-muted" style={{ fontSize: '0.8rem' }}>
              Latest issues reported by neighbours in your area
            </p>
          </div>

          <button
            onClick={onViewAllReports}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.8rem' }}
          >
            <span>See All ({reports.length})</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
          {recentReports.map(report => (
            <div
              key={report.id}
              onClick={() => onSelectReport(report)}
              className="cp-card cp-card-interactive"
              style={{
                padding: '1.1rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderLeft: report.priority === 'Critical' ? '4px solid #DC2626' : report.priority === 'High' ? '4px solid #EA580C' : '1px solid var(--border-light)'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0D9488', fontFamily: 'monospace' }}>
                      #{report.id}
                    </span>
                    <CategoryBadge category={report.category} />
                  </div>
                  <StatusBadge status={report.status} />
                </div>

                <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.35rem', lineHeight: 1.35 }}>
                  {report.title}
                </h3>

                <p style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.45, marginBottom: '0.75rem' }}>
                  {truncate(report.description, 110)}
                </p>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '0.65rem',
                  borderTop: '1px solid var(--border-light)',
                  fontSize: '0.75rem',
                  color: '#64748B'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <MapPin size={13} style={{ color: '#0D9488' }} />
                  <span style={{ fontWeight: 500, maxWidth: '170px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {report.locality}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <PriorityBadge priority={report.priority} />
                  <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                    {formatRelativeTime(report.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
