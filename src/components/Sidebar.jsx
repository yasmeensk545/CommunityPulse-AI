import React from 'react';
import { 
  Home, 
  Search, 
  ClipboardList, 
  ShieldCheck, 
  RotateCcw,
  SlidersHorizontal,
  ShieldAlert,
  ChevronRight,
  X,
  Plus
} from 'lucide-react';

export function Sidebar({
  activeTab,
  setActiveTab,
  reports = [],
  onOpenReportModal,
  onResetData,
  onOpenSettings,
  isSidebarOpen,
  setIsSidebarOpen
}) {
  const totalCount = reports.length;
  const criticalCount = reports.filter(r => r.priority === 'Critical' && r.status !== 'Resolved').length;

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      badge: null
    },
    {
      id: 'track',
      label: 'Track a Report',
      icon: Search,
      badge: null
    },
    {
      id: 'directory',
      label: 'All Community Issues',
      icon: ClipboardList,
      badge: `${totalCount}`,
      badgeType: 'neutral'
    },
    {
      id: 'admin',
      label: 'Admin & Insights',
      icon: ShieldCheck,
      badge: criticalCount > 0 ? `${criticalCount} alert${criticalCount > 1 ? 's' : ''}` : 'Portal',
      badgeType: criticalCount > 0 ? 'critical' : 'teal'
    }
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
            zIndex: 25,
            backdropFilter: 'blur(2px)'
          }}
        />
      )}

      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        {/* Mobile Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 1.25rem',
            borderBottom: '1px solid var(--border-light)'
          }}
        >
          <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B' }}>
            Menu
          </span>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="btn btn-secondary btn-sm"
            style={{ display: isSidebarOpen ? 'inline-flex' : 'none', padding: '0.25rem' }}
            aria-label="Close menu"
          >
            <X size={16} />
          </button>
        </div>

        {/* Primary Action Button inside Sidebar */}
        <div style={{ padding: '1rem 0.85rem 0.5rem' }}>
          <button
            onClick={() => {
              onOpenReportModal();
              setIsSidebarOpen(false);
            }}
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '0.65rem 1rem', fontWeight: 700 }}
          >
            <Plus size={16} />
            <span>Report a Problem</span>
          </button>
        </div>

        {/* Navigation List */}
        <nav style={{ padding: '0.75rem 0.75rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsSidebarOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.7rem 0.9rem',
                  borderRadius: '10px',
                  backgroundColor: isActive ? '#F0FDFA' : 'transparent',
                  color: isActive ? '#0F766E' : '#334155',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.875rem',
                  border: isActive ? '1px solid #CCFBF1' : '1px solid transparent',
                  transition: 'all 150ms ease',
                  textAlign: 'left',
                  width: '100%'
                }}
                className="sidebar-nav-btn"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Icon
                    size={18}
                    style={{
                      color: isActive ? '#0D9488' : '#64748B',
                      transition: 'color 150ms ease'
                    }}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '0.15rem 0.5rem',
                      borderRadius: '9999px',
                      backgroundColor:
                        item.badgeType === 'critical'
                          ? '#FEE2E2'
                          : item.badgeType === 'teal'
                          ? '#CCFBF1'
                          : '#F1F5F9',
                      color:
                        item.badgeType === 'critical'
                          ? '#991B1B'
                          : item.badgeType === 'teal'
                          ? '#0F766E'
                          : '#475569',
                      border:
                        item.badgeType === 'critical'
                          ? '1px solid #FCA5A5'
                          : item.badgeType === 'teal'
                          ? '1px solid #99F6E4'
                          : '1px solid #E2E8F0'
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Priority Alert Box */}
        {criticalCount > 0 && (
          <div style={{ padding: '0 0.85rem 0.75rem' }}>
            <div
              style={{
                backgroundColor: '#FEF2F2',
                border: '1px solid #FCA5A5',
                borderRadius: '10px',
                padding: '0.75rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem'
              }}
            >
              <ShieldAlert size={16} style={{ color: '#DC2626', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#991B1B' }}>
                  {criticalCount} Urgent Issue{criticalCount > 1 ? 's' : ''} Active
                </p>
                <button
                  onClick={() => {
                    setActiveTab('admin');
                    setIsSidebarOpen(false);
                  }}
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    color: '#B91C1C',
                    marginTop: '0.2rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '2px',
                    textDecoration: 'underline'
                  }}
                >
                  View City Queue <ChevronRight size={12} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer Settings & Reset */}
        <div
          style={{
            padding: '1rem',
            borderTop: '1px solid var(--border-light)',
            backgroundColor: '#FAFAFA'
          }}
        >
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.65rem' }}>
            <button
              onClick={onResetData}
              className="btn btn-secondary btn-sm"
              style={{ flex: 1, fontSize: '0.75rem', justifyContent: 'center' }}
              title="Reset dataset back to standard sample community reports"
            >
              <RotateCcw size={13} />
              <span>Reset Data</span>
            </button>
            <button
              onClick={onOpenSettings}
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.4rem 0.5rem' }}
              title="Settings & Diagnostics"
            >
              <SlidersHorizontal size={14} />
            </button>
          </div>

          <div style={{ fontSize: '0.7rem', color: '#64748B', lineHeight: 1.3 }}>
            <span style={{ fontWeight: 600, color: '#334155' }}>CommunityPulse Demo</span>
            <p>{totalCount} reports logged locally.</p>
          </div>
        </div>
      </aside>

      <style>{`
        .sidebar-nav-btn:hover {
          background-color: #F8FAFC;
          color: #0F172A;
        }
      `}</style>
    </>
  );
}
