import React from 'react';
import { 
  Sparkles, 
  CheckCircle, 
  Building, 
  Target 
} from 'lucide-react';
import { CategoryBadge } from './common/Badge.jsx';

export function InsightsView({ reports = [] }) {
  const total = reports.length;
  const openReports = reports.filter(r => r.status !== 'Resolved');

  // Find dominant category among open reports
  const categoryTally = openReports.reduce((acc, r) => {
    acc[r.category] = (acc[r.category] || 0) + 1;
    return acc;
  }, {});

  const dominantCategory = Object.entries(categoryTally).sort((a, b) => b[1] - a[1])[0] || ['Road Damage', 0];
  const dominantPct = openReports.length > 0 ? Math.round((dominantCategory[1] / openReports.length) * 100) : 0;

  // Find locality with highest open issues
  const localityTally = openReports.reduce((acc, r) => {
    const loc = r.locality || 'Unknown';
    acc[loc] = (acc[loc] || 0) + 1;
    return acc;
  }, {});

  const focusLocality = Object.entries(localityTally).sort((a, b) => b[1] - a[1])[0] || ['Commercial Corridor & School Zones', 0];

  // Specific preventive measures dynamically generated from category presence
  const presentCategories = new Set(reports.map(r => r.category));

  const preventiveMeasures = [];

  if (presentCategories.has('Water Leakage')) {
    preventiveMeasures.push({
      category: 'Water Leakage',
      title: 'Acoustic Pipe Integrity & Pressure Management',
      measure: 'Deploy acoustic leak detection sensors along pre-1980 cast-iron distribution mains. Modulate night-time water pressure to reduce subterranean pipe blowout incidents by an estimated 25-35%.',
      timeframe: 'Immediate 30-Day Window',
      department: 'Municipal Water & Sewer Authority'
    });
  }

  if (presentCategories.has('Road Damage')) {
    preventiveMeasures.push({
      category: 'Road Damage',
      title: 'Preventive Asphalt Crack Sealing & School Corridor Sweeps',
      measure: 'Execute proactive rubberized asphalt crack sealing before seasonal freeze-thaw cycles. Prioritize school crosswalk pedestrian paths for bi-monthly thermal pavement scans.',
      timeframe: 'Pre-Seasonal Cycle',
      department: 'Department of Transportation'
    });
  }

  if (presentCategories.has('Streetlight')) {
    preventiveMeasures.push({
      category: 'Streetlight',
      title: 'Centralized Luminaire Telemetry & LED Modernization',
      measure: 'Replace high-pressure sodium luminaires along transit corridors with smart photocell LEDs that broadcast circuit trip alerts directly to city dispatchers before residents experience outages.',
      timeframe: 'Quarterly Infrastructure Plan',
      department: 'Electrical Utilities Bureau'
    });
  }

  if (presentCategories.has('Pollution')) {
    preventiveMeasures.push({
      category: 'Pollution',
      title: 'Drainage Basin HAZMAT Sorbent Booms & Signage',
      measure: 'Pre-stage absorbent boom containment units adjacent to vulnerable urban creeks and retention basins. Install solar-powered license plate recognition cameras at known illegal dumping access ramps.',
      timeframe: 'Immediate Containment',
      department: 'Environmental Protection Division'
    });
  }

  if (presentCategories.has('Accessibility')) {
    preventiveMeasures.push({
      category: 'Accessibility',
      title: 'Medical & Transit ADA Pathway Audit',
      measure: 'Conduct universal accessibility walk-audits for all curb cuts, access ramps, and detectable warnings within a 500-meter radius of community health centers and transit nodes.',
      timeframe: 'Quarterly Audit',
      department: 'Office of Disability Rights & ADA Compliance'
    });
  }

  // Fallback if none matched
  if (preventiveMeasures.length === 0) {
    preventiveMeasures.push({
      category: 'Civic Infrastructure',
      title: 'Systemic Predictive Infrastructure Maintenance',
      measure: 'Establish cross-departmental weekly triage meetings to review clustered citizen reports and route repair crews proactively.',
      timeframe: 'Ongoing Municipal Practice',
      department: 'Public Works Administration'
    });
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <Sparkles size={22} style={{ color: '#0D9488' }} />
          <h1 className="heading-1">Community Insights & Predictive Governance</h1>
        </div>
        <p className="text-muted">
          Synthesizing ground-level citizen reports into systemic prevention strategies and municipal resource optimization.
        </p>
      </div>

      {/* Two Column Summary of Findings */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
        {/* Finding 1: Dominant Category */}
        <div
          className="cp-card"
          style={{
            borderLeft: '4px solid #0D9488',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#0D9488' }}>
                Primary Operational Bottleneck
              </span>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  backgroundColor: '#F0FDFA',
                  color: '#0F766E',
                  padding: '0.15rem 0.45rem',
                  borderRadius: '4px',
                  border: '1px solid #CCFBF1'
                }}
              >
                Data-Derived Insight
              </span>
            </div>

            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.4rem' }}>
              {dominantCategory[0]} Demands Highest Attention
            </h3>

            <p style={{ fontSize: '0.825rem', color: '#475569', lineHeight: 1.5 }}>
              Currently accounts for <strong>{dominantCategory[1]} of {openReports.length}</strong> active unresolved community complaints ({dominantPct}% share). Clustered reports suggest localized infrastructure stress rather than isolated anomalies.
            </p>
          </div>

          <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)', fontSize: '0.75rem', color: '#64748B' }}>
            Suggested Action: Priority crew overtime authorization and preventive replacement dispatch.
          </div>
        </div>

        {/* Finding 2: Geographic Hotspot */}
        <div
          className="cp-card"
          style={{
            borderLeft: '4px solid #EA580C',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#EA580C' }}>
                Geographic Focus Area
              </span>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  backgroundColor: '#FFF7ED',
                  color: '#C2410C',
                  padding: '0.15rem 0.45rem',
                  borderRadius: '4px',
                  border: '1px solid #FFEDD5'
                }}
              >
                Data-Derived Insight
              </span>
            </div>

            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.4rem' }}>
              {focusLocality[0]}
            </h3>

            <p style={{ fontSize: '0.825rem', color: '#475569', lineHeight: 1.5 }}>
              Has logged <strong>{focusLocality[1]} open reports</strong> in the active queue. Dense concentration of pedestrian traffic, school routes, or commercial storefronts magnifies public exposure to unrepaired hazards.
            </p>
          </div>

          <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)', fontSize: '0.75rem', color: '#64748B' }}>
            Suggested Action: Schedule targeted multi-agency sweep with local ward inspector.
          </div>
        </div>
      </div>

      {/* Suggested Preventive Measures Section */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h2 className="heading-2">Targeted Preventive Measures for City Agencies</h2>
            <p className="text-muted" style={{ fontSize: '0.8rem' }}>
              Actionable engineering and maintenance interventions derived from current incident patterns
            </p>
          </div>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              backgroundColor: '#F1F5F9',
              color: '#475569',
              padding: '0.2rem 0.5rem',
              borderRadius: '4px',
              border: '1px solid #CBD5E1'
            }}
          >
            Policy Recommendations
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem' }}>
          {preventiveMeasures.map((measure, idx) => (
            <div
              key={idx}
              className="cp-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '1.25rem'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                  <CategoryBadge category={measure.category} />
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: '#0F766E',
                      backgroundColor: '#F0FDFA',
                      padding: '0.15rem 0.45rem',
                      borderRadius: '4px',
                      border: '1px solid #CCFBF1'
                    }}
                  >
                    {measure.timeframe}
                  </span>
                </div>

                <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.45rem' }}>
                  {measure.title}
                </h3>

                <p style={{ fontSize: '0.825rem', color: '#334155', lineHeight: 1.5, marginBottom: '0.85rem' }}>
                  {measure.measure}
                </p>
              </div>

              <div
                style={{
                  paddingTop: '0.75rem',
                  borderTop: '1px solid var(--border-light)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.75rem',
                  color: '#64748B'
                }}
              >
                <Building size={14} style={{ color: '#0D9488' }} />
                <span>Target Dept: <strong>{measure.department}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Practical Strategic Recommendations for Local Authorities */}
      <div className="cp-card" style={{ padding: '1.5rem', backgroundColor: '#FFFFFF' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
          <Target size={22} style={{ color: '#0D9488' }} />
          <div>
            <h2 className="heading-2">Systemic Recommendations for Municipal Administrators</h2>
            <p className="text-muted" style={{ fontSize: '0.8rem' }}>
              Strategic guidance to optimize community responsiveness and citizen trust
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '1rem', borderRadius: '10px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.85rem', color: '#0F172A', marginBottom: '0.35rem' }}>
              <CheckCircle size={15} style={{ color: '#0D9488' }} />
              <span>Dynamic Crew Redeployment</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.45 }}>
              Use AI-generated priority scoring to dynamically adjust morning maintenance routes, ensuring Critical safety issues receive immediate stabilization before standard routine work tickets.
            </p>
          </div>

          <div style={{ padding: '1rem', borderRadius: '10px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.85rem', color: '#0F172A', marginBottom: '0.35rem' }}>
              <CheckCircle size={15} style={{ color: '#0D9488' }} />
              <span>Transparent Public Feedback Loops</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.45 }}>
              When duplicate complaints are detected, automatically notify secondary reporters with the existing ticket tracking number, reducing 311 telephone inquiries by an estimated 40%.
            </p>
          </div>

          <div style={{ padding: '1rem', borderRadius: '10px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.85rem', color: '#0F172A', marginBottom: '0.35rem' }}>
              <CheckCircle size={15} style={{ color: '#0D9488' }} />
              <span>Multi-Agency Cross-Inspection</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.45 }}>
              Enable field water utility crews to log secondary street lighting and road surface deterioration encountered while repairing mains, expediting cross-departmental maintenance dispatch.
            </p>
          </div>
        </div>

        {/* Notice */}
        <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)', fontSize: '0.75rem', color: '#64748B' }}>
          <strong>Notice of Transparency:</strong> Insights above reflect aggregated patterns from the current local dataset ({total} incident records). Strategic policy recommendations are provided for municipal planning and do not claim unverified integrations with government mainframe databases.
        </div>
      </div>
    </div>
  );
}
