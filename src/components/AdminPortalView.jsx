import React, { useState } from 'react';
import { 
  BarChart3, 
  Lightbulb, 
  ClipboardList, 
  SlidersHorizontal
} from 'lucide-react';
import { IssueDirectory } from './IssueDirectory.jsx';
import { AnalyticsView } from './AnalyticsView.jsx';
import { InsightsView } from './InsightsView.jsx';

export function AdminPortalView({
  reports = [],
  onSelectReport,
  onOpenReportModal,
  onOpenSettingsModal
}) {
  const [adminTab, setAdminTab] = useState('directory'); // 'directory', 'analytics', 'insights'

  const subNav = [
    { id: 'directory', label: 'Issue Directory & Triage', icon: ClipboardList, count: reports.length },
    { id: 'analytics', label: 'Telemetry & Charts', icon: BarChart3 },
    { id: 'insights', label: 'Preventive Insights', icon: Lightbulb }
  ];

  return (
    <div>
      {/* Top Header with Portal Badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
            <span
              style={{
                backgroundColor: '#1E293B',
                color: '#FFFFFF',
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}
            >
              Municipal Portal
            </span>
            <span className="text-muted" style={{ fontSize: '0.8rem' }}>City Administration & Public Works Desk</span>
          </div>
          <h1 className="heading-1" style={{ fontSize: '1.6rem' }}>
            Admin Operations & Decision Support
          </h1>
        </div>

        {/* Settings / Data Controls shortcut */}
        <button
          onClick={onOpenSettingsModal}
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <SlidersHorizontal size={14} />
          <span>Storage & API Settings</span>
        </button>
      </div>

      {/* Sub-Navigation Pills */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '1.75rem',
          borderBottom: '1px solid var(--border-light)',
          paddingBottom: '0.75rem',
          overflowX: 'auto'
        }}
      >
        {subNav.map(item => {
          const Icon = item.icon;
          const isActive = adminTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setAdminTab(item.id)}
              className="btn btn-sm"
              style={{
                backgroundColor: isActive ? '#0D9488' : '#FFFFFF',
                color: isActive ? '#FFFFFF' : '#475569',
                border: isActive ? '1px solid #0F766E' : '1px solid var(--border-light)',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.825rem',
                borderRadius: '8px',
                padding: '0.5rem 0.85rem'
              }}
            >
              <Icon size={15} />
              <span>{item.label}</span>
              {item.count !== undefined && (
                <span
                  style={{
                    backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : '#F1F5F9',
                    color: isActive ? '#FFFFFF' : '#334155',
                    fontSize: '0.7rem',
                    padding: '0.1rem 0.4rem',
                    borderRadius: '9999px',
                    marginLeft: '2px'
                  }}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      {adminTab === 'directory' && (
        <IssueDirectory
          reports={reports}
          onSelectReport={onSelectReport}
          onOpenReportModal={onOpenReportModal}
        />
      )}

      {adminTab === 'analytics' && (
        <AnalyticsView reports={reports} />
      )}

      {adminTab === 'insights' && (
        <InsightsView reports={reports} />
      )}
    </div>
  );
}
