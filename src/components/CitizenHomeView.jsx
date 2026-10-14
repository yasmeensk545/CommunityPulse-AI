import React from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  AlertTriangle, 
  Droplets, 
  Lightbulb, 
  ShieldAlert, 
  Accessibility, 
  HelpCircle,
  Sparkles,
  ArrowRight,
  MapPin
} from 'lucide-react';
import { PriorityBadge, StatusBadge, CategoryBadge } from './common/Badge.jsx';
import { formatRelativeTime, truncate } from '../utils/formatters.js';

const CATEGORY_CARDS = [
  { id: 'Waste Management', label: 'Garbage & Waste', icon: Trash2, desc: 'Overflowing bins, illegal litter' },
  { id: 'Road Damage', label: 'Road Damage', icon: AlertTriangle, desc: 'Potholes, broken roads, craters' },
  { id: 'Water Leakage', label: 'Water Leakage', icon: Droplets, desc: 'Burst pipes, street flooding, leaks' },
  { id: 'Streetlight', label: 'Streetlights', icon: Lightbulb, desc: 'Dark streetlights, unlit walkways' },
  { id: 'Pollution', label: 'Pollution', icon: ShieldAlert, desc: 'Chemical odors, open dumping' },
  { id: 'Public Safety', label: 'Public Safety', icon: ShieldAlert, desc: 'Signal failures, hazardous zones' },
  { id: 'Accessibility', label: 'Accessibility', icon: Accessibility, desc: 'Broken ramps, blocked sidewalks' },
  { id: 'Other', label: 'Other Issues', icon: HelpCircle, desc: 'General community concerns' }
];

export function CitizenHomeView({
  reports = [],
  onOpenReportModal,
  onNavigateToTrack,
  onSelectReport,
  onViewAllReports
}) {
  // Counts based on Pending, In Progress, Resolved
  const pendingCount = reports.filter(r => r.status === 'Pending').length;
  const inProgressCount = reports.filter(r => r.status === 'In Progress').length;
  const resolvedCount = reports.filter(r => r.status === 'Resolved').length;

  // Recent 4 community reports
  const recentReports = [...reports]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4);

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* 1. Welcoming Citizen Hero */}
      <section
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          border: '1px solid var(--border-light)',
          padding: '2.5rem 2rem',
          textAlign: 'center',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        {/* Brand Tagline Badge */}
        <div style={{ marginBottom: '1rem' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.35rem 0.95rem',
              borderRadius: '9999px',
              backgroundColor: '#EFF6FF',
              color: '#1D4ED8',
              fontSize: '0.82rem',
              fontWeight: 700,
              letterSpacing: '0.02em',
              border: '1px solid #BFDBFE'
            }}
          >
            <Sparkles size={14} />
            <span>CommunityPulse • Smarter Communities. Better Living.</span>
          </span>
        </div>

        {/* Telugu-English welcoming hint */}
        <p style={{ color: '#0F766E', fontSize: '0.84rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          మీ పరిసరాల సమస్యలను సులభంగా నివేదించండి — Report local civic issues easily
        </p>

        {/* Main Heading */}
        <h1
          className="citizen-hero-title"
          style={{
            fontSize: '2.25rem',
            fontWeight: 800,
            color: '#0F172A',
            letterSpacing: '-0.02em',
            marginBottom: '0.75rem',
            lineHeight: 1.2
          }}
        >
          Make Your Community Better
        </h1>

        {/* Description */}
        <p
          style={{
            fontSize: '1.05rem',
            color: '#475569',
            maxWidth: '620px',
            margin: '0 auto 2rem',
            lineHeight: 1.55
          }}
        >
          Report local problems, help the right department identify them, and track progress.
        </p>

        {/* Action Buttons: Large Blue Primary + Secondary */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            flexWrap: 'wrap'
          }}
        >
          <button
            onClick={() => onOpenReportModal()}
            className="btn btn-blue btn-lg"
            style={{
              fontSize: '1.05rem',
              padding: '0.9rem 2rem',
              borderRadius: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: 700
            }}
            id="hero-report-problem-btn"
          >
            <Plus size={20} />
            <span>Report a Problem</span>
          </button>

          <button
            onClick={onNavigateToTrack}
            className="btn btn-secondary btn-lg"
            style={{
              fontSize: '1.05rem',
              padding: '0.9rem 1.8rem',
              borderRadius: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: 600,
              backgroundColor: '#FFFFFF',
              border: '1px solid #CBD5E1'
            }}
            id="hero-track-report-btn"
          >
            <Search size={18} />
            <span>Track My Report</span>
          </button>
        </div>
      </section>

      {/* 2. Simple Three-Step Visual */}
      <section>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', marginBottom: '1rem', textAlign: 'center' }}>
          How CommunityPulse Works
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
          {/* Step 1 */}
          <div
            className="cp-card"
            style={{
              padding: '1.5rem',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1rem'
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#EFF6FF',
                color: '#2563EB',
                fontWeight: 800,
                fontSize: '1.1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              1
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.25rem' }}>
                1. Report an Issue
              </h3>
              <p className="text-muted" style={{ fontSize: '0.82rem', lineHeight: 1.45 }}>
                Tell us what is broken, select the location, and optionally attach a photo.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div
            className="cp-card"
            style={{
              padding: '1.5rem',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1rem'
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#EFF6FF',
                color: '#2563EB',
                fontWeight: 800,
                fontSize: '1.1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              2
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.25rem' }}>
                2. Get Your Report ID
              </h3>
              <p className="text-muted" style={{ fontSize: '0.82rem', lineHeight: 1.45 }}>
                Get an instant tracking ID (like <code style={{ color: '#2563EB', fontWeight: 600 }}>CP-2026-80124</code>) to save or copy.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div
            className="cp-card"
            style={{
              padding: '1.5rem',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1rem'
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#EFF6FF',
                color: '#2563EB',
                fontWeight: 800,
                fontSize: '1.1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              3
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.25rem' }}>
                3. Track Your Status
              </h3>
              <p className="text-muted" style={{ fontSize: '0.82rem', lineHeight: 1.45 }}>
                Follow progress anytime from Pending to In Progress to Resolved with crew notes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Simple Issue Category Cards */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F172A' }}>
              Common Problem Categories
            </h2>
            <p className="text-muted" style={{ fontSize: '0.82rem' }}>
              Tap any category below to quickly file a report:
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '1rem' }}>
          {CATEGORY_CARDS.map(cat => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.id}
                onClick={() => onOpenReportModal(cat.id)}
                className="cp-card cp-card-interactive"
                style={{
                  padding: '1.25rem 1rem',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  cursor: 'pointer',
                  border: '1px solid var(--border-light)'
                }}
              >
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    backgroundColor: '#EFF6FF',
                    color: '#2563EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Icon size={20} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F172A', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {cat.label}
                  </h3>
                  <p className="text-muted" style={{ fontSize: '0.74rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {cat.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Small Explanation of How AI Helps */}
      <section>
        <div
          style={{
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '16px',
            padding: '1.5rem 1.75rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Sparkles size={18} style={{ color: '#2563EB' }} />
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
              How AI Helps Our Community
            </h2>
          </div>

          <p style={{ fontSize: '0.84rem', color: '#475569', marginBottom: '1rem', lineHeight: 1.5 }}>
            CommunityPulse uses explainable artificial intelligence to assist residents and municipal staff:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            <div style={{ backgroundColor: '#FFFFFF', padding: '0.9rem 1rem', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
              <strong style={{ fontSize: '0.84rem', color: '#1E293B', display: 'block', marginBottom: '0.2rem' }}>
                🏷️ Automatic Categorization
              </strong>
              <p style={{ fontSize: '0.78rem', color: '#64748B', margin: 0, lineHeight: 1.4 }}>
                Interprets citizen descriptions to correctly classify hazards (roads, water, electrical).
              </p>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', padding: '0.9rem 1rem', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
              <strong style={{ fontSize: '0.84rem', color: '#1E293B', display: 'block', marginBottom: '0.2rem' }}>
                ⚡ Urgency Prioritization
              </strong>
              <p style={{ fontSize: '0.78rem', color: '#64748B', margin: 0, lineHeight: 1.4 }}>
                Evaluates safety risks (school crosswalks, burst water pipes) so critical dangers get fixed first.
              </p>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', padding: '0.9rem 1rem', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
              <strong style={{ fontSize: '0.84rem', color: '#1E293B', display: 'block', marginBottom: '0.2rem' }}>
                🏛️ Department Recommendation
              </strong>
              <p style={{ fontSize: '0.78rem', color: '#64748B', margin: 0, lineHeight: 1.4 }}>
                Routes the report directly to the responsible municipal team, preventing delays.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Three Simple Status Summary Cards */}
      <section>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', marginBottom: '1rem' }}>
          Current Neighbourhood Overview
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {/* Pending Card */}
          <div
            className="cp-card cp-card-interactive"
            onClick={onViewAllReports}
            style={{
              padding: '1.25rem',
              borderTop: '4px solid #D97706',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#92400E', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Pending
              </span>
              <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A', marginTop: '0.2rem' }}>
                {pendingCount}
              </h3>
            </div>
            <p className="text-muted" style={{ fontSize: '0.78rem', marginTop: '0.5rem' }}>
              Newly reported issues awaiting department crew dispatch.
            </p>
          </div>

          {/* In Progress Card */}
          <div
            className="cp-card cp-card-interactive"
            onClick={onViewAllReports}
            style={{
              padding: '1.25rem',
              borderTop: '4px solid #2563EB',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#1E40AF', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                In Progress
              </span>
              <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A', marginTop: '0.2rem' }}>
                {inProgressCount}
              </h3>
            </div>
            <p className="text-muted" style={{ fontSize: '0.78rem', marginTop: '0.5rem' }}>
              Crews are actively inspecting or repairing on site.
            </p>
          </div>

          {/* Resolved Card */}
          <div
            className="cp-card cp-card-interactive"
            onClick={onViewAllReports}
            style={{
              padding: '1.25rem',
              borderTop: '4px solid #16A34A',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Resolved
              </span>
              <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A', marginTop: '0.2rem' }}>
                {resolvedCount}
              </h3>
            </div>
            <p className="text-muted" style={{ fontSize: '0.78rem', marginTop: '0.5rem' }}>
              Successfully completed and verified issues.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Recent Community Reports */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F172A' }}>
              Recent Community Reports
            </h2>
            <p className="text-muted" style={{ fontSize: '0.8rem' }}>
              Recent issues logged by neighbours in your area
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
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563EB', fontFamily: 'monospace' }}>
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
