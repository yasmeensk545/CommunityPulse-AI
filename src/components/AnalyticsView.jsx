import React from 'react';
import { 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  Layers, 
  Building,
  Activity
} from 'lucide-react';
import { StatCard } from './common/StatCard.jsx';
import { VALID_CATEGORIES } from '../services/storage.js';

export function AnalyticsView({ reports = [] }) {
  const total = reports.length;
  const resolved = reports.filter(r => r.status === 'Resolved').length;
  const inProgress = reports.filter(r => r.status === 'In Progress').length;
  const underReview = reports.filter(r => r.status === 'Under Review').length;
  const reported = reports.filter(r => r.status === 'Reported').length;
  const openReports = reports.filter(r => r.status !== 'Resolved').length;

  const critical = reports.filter(r => r.priority === 'Critical').length;
  const high = reports.filter(r => r.priority === 'High').length;
  const medium = reports.filter(r => r.priority === 'Medium').length;
  const low = reports.filter(r => r.priority === 'Low').length;

  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
  const criticalBacklog = reports.filter(r => r.priority === 'Critical' && r.status !== 'Resolved').length;

  // Category counts
  const categoryCounts = VALID_CATEGORIES.map(cat => {
    const count = reports.filter(r => r.category === cat).length;
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return { category: cat, count, pct };
  }).sort((a, b) => b.count - a.count);

  // Status breakdown
  const statusCounts = [
    { status: 'Reported', count: reported, color: '#64748B', bg: '#F1F5F9' },
    { status: 'Under Review', count: underReview, color: '#D97706', bg: '#FEF3C7' },
    { status: 'In Progress', count: inProgress, color: '#4F46E5', bg: '#EEF2FF' },
    { status: 'Resolved', count: resolved, color: '#16A34A', bg: '#DCFCE7' }
  ];

  // Priority breakdown
  const priorityCounts = [
    { priority: 'Critical', count: critical, color: '#DC2626', bg: '#FEE2E2', scoreRange: '80-100 pts' },
    { priority: 'High', count: high, color: '#EA580C', bg: '#FFEDD5', scoreRange: '60-79 pts' },
    { priority: 'Medium', count: medium, color: '#0284C7', bg: '#E0F2FE', scoreRange: '35-59 pts' },
    { priority: 'Low', count: low, color: '#64748B', bg: '#F1F5F9', scoreRange: '0-34 pts' }
  ];

  // Frequently reported localities / Hotspots
  const localityMap = reports.reduce((acc, r) => {
    const loc = r.locality || 'Unspecified';
    if (!acc[loc]) {
      acc[loc] = { count: 0, criticalCount: 0, categories: {} };
    }
    acc[loc].count += 1;
    if (r.priority === 'Critical' || r.priority === 'High') {
      acc[loc].criticalCount += 1;
    }
    acc[loc].categories[r.category] = (acc[loc].categories[r.category] || 0) + 1;
    return acc;
  }, {});

  const topLocalities = Object.entries(localityMap)
    .map(([locality, data]) => {
      const topCat = Object.entries(data.categories).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Civic';
      return {
        locality,
        count: data.count,
        criticalCount: data.criticalCount,
        topCategory: topCat
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  // Department distribution
  const deptMap = reports.reduce((acc, r) => {
    const dept = r.aiAnalysis?.department || 'General Municipal Services';
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {});

  const topDepartments = Object.entries(deptMap)
    .map(([dept, count]) => ({ dept, count, pct: total > 0 ? Math.round((count / total) * 100) : 0 }))
    .sort((a, b) => b.count - a.count);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="heading-1">Live Analytics & Infrastructure Telemetry</h1>
        <p className="text-muted" style={{ marginTop: '0.2rem' }}>
          Data-driven aggregation of community incident velocity, severity distribution, and municipal response metrics.
        </p>
      </div>

      {/* Top Metrics Grid */}
      <div className="stats-grid">
        <StatCard
          icon={Layers}
          label="Total Intake"
          value={total}
          trend={`${openReports} Active Tickets`}
          subtext="in civic storage"
          color="teal"
        />
        <StatCard
          icon={AlertTriangle}
          label="Critical Backlog"
          value={criticalBacklog}
          trend={`${critical} total critical`}
          subtext="immediate hazards"
          color="red"
        />
        <StatCard
          icon={CheckCircle2}
          label="Resolution Rate"
          value={`${resolutionRate}%`}
          trend={`${resolved} closed`}
          subtext="of total complaints"
          color="green"
        />
        <StatCard
          icon={Activity}
          label="Active In Flight"
          value={inProgress}
          trend={`${underReview} in review`}
          subtext="currently being worked"
          color="blue"
        />
      </div>

      {/* Split Grid Row 1: Category & Priority */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Category Distribution Chart */}
        <div className="cp-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h2 className="heading-2" style={{ fontSize: '1.1rem' }}>Incident Category Distribution</h2>
              <p className="text-muted" style={{ fontSize: '0.78rem' }}>Breakdown of citizen complaints by domain</p>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0D9488' }}>
              {VALID_CATEGORIES.length} Categories
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {categoryCounts.map(item => (
              <div key={item.category}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: 600, color: '#334155' }}>{item.category}</span>
                  <span style={{ fontWeight: 700, color: '#0F172A' }}>
                    {item.count} <span className="text-muted" style={{ fontWeight: 400 }}>({item.pct}%)</span>
                  </span>
                </div>
                <div style={{ height: '8px', backgroundColor: '#F1F5F9', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${item.pct}%`,
                      background: 'linear-gradient(90deg, #0D9488 0%, #14B8A6 100%)',
                      borderRadius: '9999px',
                      transition: 'width 400ms ease'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Level Breakdown */}
        <div className="cp-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h2 className="heading-2" style={{ fontSize: '1.1rem' }}>Priority & Urgency Spectrum</h2>
              <p className="text-muted" style={{ fontSize: '0.78rem' }}>AI-weighted severity classification</p>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B' }}>
              0 - 100 Scale
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {priorityCounts.map(item => {
              const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
              return (
                <div
                  key={item.priority}
                  style={{
                    padding: '0.85rem',
                    borderRadius: '10px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.4rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span
                        style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          backgroundColor: item.color
                        }}
                      />
                      <strong style={{ fontSize: '0.875rem', color: '#0F172A' }}>{item.priority}</strong>
                      <span className="text-muted" style={{ fontSize: '0.72rem' }}>({item.scoreRange})</span>
                    </div>

                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F172A' }}>
                      {item.count} <span className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 400 }}>({pct}%)</span>
                    </span>
                  </div>

                  <div style={{ height: '6px', backgroundColor: '#F1F5F9', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${pct}%`,
                        backgroundColor: item.color,
                        borderRadius: '9999px'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Split Grid Row 2: Status Pipeline & Locality Hotspots */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Status Pipeline */}
        <div className="cp-card">
          <div style={{ marginBottom: '1.25rem' }}>
            <h2 className="heading-2" style={{ fontSize: '1.1rem' }}>Municipal Operational Pipeline</h2>
            <p className="text-muted" style={{ fontSize: '0.78rem' }}>Intake, inspection, active repair, and signoff stages</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.85rem', marginBottom: '1.25rem' }}>
            {statusCounts.map(item => (
              <div
                key={item.status}
                style={{
                  padding: '1rem',
                  borderRadius: '10px',
                  backgroundColor: item.bg,
                  border: `1px solid ${item.color}30`
                }}
              >
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: item.color, textTransform: 'uppercase' }}>
                  {item.status}
                </p>
                <h3 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0F172A', marginTop: '0.2rem' }}>
                  {item.count}
                </h3>
                <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                  {total > 0 ? Math.round((item.count / total) * 100) : 0}% of all tickets
                </span>
              </div>
            ))}
          </div>

          {/* Pipeline Progress Bar */}
          <div style={{ height: '12px', backgroundColor: '#E2E8F0', borderRadius: '9999px', overflow: 'hidden', display: 'flex' }}>
            {statusCounts.map(item => {
              const widthPct = total > 0 ? (item.count / total) * 100 : 0;
              return (
                <div
                  key={item.status}
                  style={{
                    height: '100%',
                    width: `${widthPct}%`,
                    backgroundColor: item.color,
                    transition: 'width 300ms ease'
                  }}
                  title={`${item.status}: ${item.count}`}
                />
              );
            })}
          </div>
        </div>

        {/* Locality Hotspots */}
        <div className="cp-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h2 className="heading-2" style={{ fontSize: '1.1rem' }}>Civic Incident Hotspots</h2>
              <p className="text-muted" style={{ fontSize: '0.78rem' }}>Neighborhoods with concentrated community reports</p>
            </div>
            <MapPin size={18} style={{ color: '#0D9488' }} />
          </div>

          {topLocalities.length === 0 ? (
            <p className="text-muted" style={{ textAlign: 'center', padding: '2rem 0', fontSize: '0.85rem' }}>
              No geographic locality data logged yet.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {topLocalities.map((item, idx) => (
                <div
                  key={item.locality}
                  style={{
                    padding: '0.75rem 0.9rem',
                    borderRadius: '8px',
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <span
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '6px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #CBD5E1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: '#0D9488'
                      }}
                    >
                      {idx + 1}
                    </span>
                    <div>
                      <h4 style={{ fontSize: '0.825rem', fontWeight: 600, color: '#0F172A' }}>
                        {item.locality}
                      </h4>
                      <p className="text-muted" style={{ fontSize: '0.72rem' }}>
                        Primary: <strong>{item.topCategory}</strong>
                      </p>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>
                      {item.count} report{item.count > 1 ? 's' : ''}
                    </span>
                    {item.criticalCount > 0 && (
                      <span style={{ display: 'block', fontSize: '0.7rem', color: '#DC2626', fontWeight: 600 }}>
                        {item.criticalCount} Critical
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Row 3: Department Workload Allocation */}
      <div className="cp-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h2 className="heading-2" style={{ fontSize: '1.1rem' }}>Municipal Agency Routing Breakdown</h2>
            <p className="text-muted" style={{ fontSize: '0.78rem' }}>Volume of civic tickets routed to each municipal department</p>
          </div>
          <Building size={18} style={{ color: '#0D9488' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.85rem' }}>
          {topDepartments.map(item => (
            <div
              key={item.dept}
              style={{
                padding: '0.85rem',
                borderRadius: '8px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '75px'
              }}
            >
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1E293B' }}>{item.dept}</span>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                <span className="text-muted" style={{ fontSize: '0.75rem' }}>{item.pct}% workload share</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0D9488' }}>
                  {item.count} ticket{item.count > 1 ? 's' : ''}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
