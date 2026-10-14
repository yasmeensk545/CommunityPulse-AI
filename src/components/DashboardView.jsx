import React from 'react';
import { 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  ArrowRight, 
  Sparkles,
  TrendingUp,
  ShieldAlert,
  Layers,
  Plus
} from 'lucide-react';
import { StatCard } from './common/StatCard.jsx';
import { PriorityBadge, StatusBadge, CategoryBadge, AiSourceBadge } from './common/Badge.jsx';
import { formatRelativeTime, truncate } from '../utils/formatters.js';

export function DashboardView({
  reports = [],
  onSelectReport,
  onOpenReportModal,
  onViewAllReports,
  onViewAnalytics
}) {
  const total = reports.length;
  const resolved = reports.filter(r => r.status === 'Resolved').length;
  const openReports = reports.filter(r => r.status !== 'Resolved');
  const criticalReports = reports.filter(r => r.priority === 'Critical' && r.status !== 'Resolved');
  const highPriority = reports.filter(r => (r.priority === 'Critical' || r.priority === 'High') && r.status !== 'Resolved');
  
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  // Category breakdown counts
  const categoryCounts = reports.reduce((acc, r) => {
    acc[r.category] = (acc[r.category] || 0) + 1;
    return acc;
  }, {});

  const topCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Sorted by recency
  const recentReports = [...reports]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  // Recent resolution notes / activity
  const recentActivities = reports
    .flatMap(r => (r.resolutionNotes || []).map(n => ({
      ...n,
      reportId: r.id,
      reportTitle: r.title,
      category: r.category
    })))
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 4);

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="heading-1">Civic Operations Dashboard</h1>
          <p className="text-muted" style={{ marginTop: '0.2rem' }}>
            Real-time municipal triage, predictive prioritization, and neighborhood telemetry.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button onClick={onViewAnalytics} className="btn btn-secondary btn-sm">
            <TrendingUp size={15} />
            <span>View Full Analytics</span>
          </button>
          <button onClick={onOpenReportModal} className="btn btn-primary btn-sm">
            <Plus size={15} />
            <span>Report Issue</span>
          </button>
        </div>
      </div>

      {/* Critical Attention Banner */}
      {criticalReports.length > 0 && (
        <div
          style={{
            backgroundColor: '#FEF2F2',
            border: '1px solid #F87171',
            borderRadius: '14px',
            padding: '1rem 1.25rem',
            marginBottom: '1.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            boxShadow: '0 2px 8px rgba(220, 38, 38, 0.08)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: '#DC2626',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <ShieldAlert size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h4 style={{ color: '#991B1B', fontWeight: 700, fontSize: '0.95rem' }}>
                  {criticalReports.length} Critical Safety Issue{criticalReports.length > 1 ? 's' : ''} Awaiting Attention
                </h4>
                <span
                  style={{
                    backgroundColor: '#DC2626',
                    color: '#FFFFFF',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    padding: '0.1rem 0.4rem',
                    borderRadius: '4px',
                    textTransform: 'uppercase'
                  }}
                >
                  Urgent
                </span>
              </div>
              <p style={{ color: '#7F1D1D', fontSize: '0.8rem', marginTop: '2px' }}>
                Active hazard in "{criticalReports[0]?.title}" at {criticalReports[0]?.locality}.
              </p>
            </div>
          </div>

          <button
            onClick={() => onSelectReport(criticalReports[0])}
            className="btn btn-sm"
            style={{
              backgroundColor: '#991B1B',
              color: '#FFFFFF',
              fontWeight: 600,
              fontSize: '0.8rem'
            }}
          >
            Review First Critical Issue
            <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* Primary Metric Cards */}
      <div className="stats-grid">
        <StatCard
          icon={FileText}
          label="Total Reports"
          value={total}
          trend={`${total} logged`}
          subtext="in civic database"
          color="teal"
          onClick={onViewAllReports}
        />
        <StatCard
          icon={Clock}
          label="Active / Open"
          value={openReports.length}
          trend={`${openReports.length} in progress`}
          subtext="needs resolution"
          color="blue"
          onClick={onViewAllReports}
        />
        <StatCard
          icon={AlertTriangle}
          label="High & Critical"
          value={highPriority.length}
          trend={`${highPriority.length} high impact`}
          subtext="accelerated priority"
          color="orange"
          onClick={onViewAllReports}
        />
        <StatCard
          icon={CheckCircle2}
          label="Resolved Issues"
          value={resolved}
          trend={`${resolutionRate}% resolution`}
          subtext="community efficiency"
          color="green"
          onClick={onViewAllReports}
        />
      </div>

      {/* Main Two-Column Layout */}
      <div className="dashboard-split">
        {/* Left Column: Recent Community Reports */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="cp-card">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.25rem',
                borderBottom: '1px solid var(--border-light)',
                paddingBottom: '0.75rem'
              }}
            >
              <div>
                <h2 className="heading-2">Recent Community Reports</h2>
                <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '2px' }}>
                  Latest incidents submitted with predictive priority scores
                </p>
              </div>
              <button
                onClick={onViewAllReports}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.78rem' }}
              >
                <span>View All ({total})</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* List */}
            {recentReports.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <Layers size={36} style={{ color: '#94A3B8', margin: '0 auto 0.75rem' }} />
                <h4 style={{ fontWeight: 600, color: '#334155' }}>No Reports Logged Yet</h4>
                <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.3rem', maxWidth: '300px', margin: '0.3rem auto 1rem' }}>
                  Be the first to report an issue in your neighborhood.
                </p>
                <button onClick={onOpenReportModal} className="btn btn-primary btn-sm">
                  <Plus size={14} />
                  <span>Report First Issue</span>
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {recentReports.map(report => (
                  <div
                    key={report.id}
                    onClick={() => onSelectReport(report)}
                    className="cp-card cp-card-interactive"
                    style={{
                      padding: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid var(--border-light)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0D9488', fontFamily: 'monospace' }}>
                          #{report.id}
                        </span>
                        <CategoryBadge category={report.category} />
                        {report.isSample && (
                          <span className="badge badge-sample">Sample Data</span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <PriorityBadge priority={report.priority} showScore={true} score={report.priorityScore} />
                        <StatusBadge status={report.status} />
                      </div>
                    </div>

                    <h4 style={{ fontSize: '0.98rem', fontWeight: 600, color: '#0F172A', marginTop: '2px' }}>
                      {report.title}
                    </h4>

                    <p style={{ fontSize: '0.825rem', color: '#475569', lineHeight: 1.4 }}>
                      {truncate(report.description, 140)}
                    </p>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: '0.25rem',
                        paddingTop: '0.5rem',
                        borderTop: '1px dashed var(--border-light)',
                        fontSize: '0.75rem',
                        color: '#64748B'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <MapPin size={13} style={{ color: '#0D9488' }} />
                        <span style={{ fontWeight: 500 }}>{report.locality}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {report.aiAnalysis && (
                          <AiSourceBadge source={report.aiAnalysis.source} isRealAi={report.aiAnalysis.isRealAi} />
                        )}
                        <span>{formatRelativeTime(report.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Category Distribution & Live Activity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Category Mini Breakdown */}
          <div className="cp-card">
            <h3 className="heading-3" style={{ marginBottom: '0.75rem' }}>
              Issue Distribution
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {topCategories.map(([category, count]) => {
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={category}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 500, color: '#334155' }}>{category}</span>
                      <span style={{ fontWeight: 600, color: '#0F172A' }}>
                        {count} <span className="text-muted" style={{ fontWeight: 400 }}>({pct}%)</span>
                      </span>
                    </div>
                    <div
                      style={{
                        height: '6px',
                        backgroundColor: '#F1F5F9',
                        borderRadius: '9999px',
                        overflow: 'hidden'
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${pct}%`,
                          background: 'linear-gradient(90deg, #0D9488 0%, #14B8A6 100%)',
                          borderRadius: '9999px',
                          transition: 'width 300ms ease'
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Municipal Actions */}
          <div className="cp-card">
            <h3 className="heading-3" style={{ marginBottom: '0.85rem' }}>
              Recent Civic Actions & Notes
            </h3>

            {recentActivities.length === 0 ? (
              <p className="text-muted" style={{ fontSize: '0.8rem', textAlign: 'center', padding: '1.5rem 0' }}>
                No inspection or resolution notes logged yet.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {recentActivities.map(activity => (
                  <div
                    key={activity.id}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '8px',
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      fontSize: '0.8rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 600, color: '#0F172A' }}>
                        {activity.author}
                      </span>
                      <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                        {formatRelativeTime(activity.timestamp)}
                      </span>
                    </div>
                    <p style={{ color: '#475569', lineHeight: 1.35, fontSize: '0.78rem' }}>
                      "{activity.text}"
                    </p>
                    <div style={{ marginTop: '0.35rem', fontSize: '0.72rem', color: '#0D9488', fontWeight: 500 }}>
                      Ref: #{activity.reportId} - {truncate(activity.reportTitle, 35)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Decision Support Notice */}
          <div
            style={{
              padding: '1rem',
              borderRadius: '12px',
              backgroundColor: '#F0FDFA',
              border: '1px solid #CCFBF1',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.65rem'
            }}
          >
            <Sparkles size={18} style={{ color: '#0D9488', flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.78rem', color: '#115E59', lineHeight: 1.4 }}>
              <strong style={{ color: '#0F766E' }}>Ethical AI Decision Support:</strong> Priority scores and dispatch recommendations are advisory. Municipal supervisors retain full authority for all physical work orders.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
