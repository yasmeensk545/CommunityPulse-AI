import React from 'react';
import { 
  Home, 
  Search, 
  ClipboardList, 
  Building2, 
  BarChart3, 
  Lightbulb, 
  RotateCcw,
  SlidersHorizontal,
  ShieldAlert,
  ChevronRight,
  X,
  Plus,
  Lock
} from 'lucide-react';
import { storageService } from '../services/storage.js';

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
  const isStaffLoggedIn = storageService.isStaffAuthenticated();
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
      label: 'Track My Report',
      icon: Search,
      badge: null
    },
    {
      id: 'directory',
      label: 'Community Issues',
      icon: ClipboardList,
      badge: `${totalCount}`,
      badgeType: 'neutral'
    },
    {
      id: 'department',
      label: isStaffLoggedIn ? 'Department Dashboard' : 'Staff Portal (Login)',
      icon: isStaffLoggedIn ? Building2 : Lock,
      badge: isStaffLoggedIn ? 'Staff' : 'Protected',
      badgeType: isStaffLoggedIn ? 'blue' : 'neutral'
    },
    {
      id: 'analytics',
      label: 'Live Analytics',
      icon: BarChart3,
      badge: null
    },
    {
      id: 'insights',
      label: 'Community Insights',
      icon: Lightbulb,
      badge: null
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
            CommunityPulse
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

        {/* Primary Action Button inside Sidebar: Blue */}
        <div style={{ padding: '1rem 0.85rem 0.5rem' }}>
          <button
            onClick={() => {
              onOpenReportModal();
              setIsSidebarOpen(false);
            }}
            className="btn btn-blue"
            style={{ width: '100%', justifyContent: 'center', padding: '0.7rem 1rem', fontWeight: 700, borderRadius: '10px' }}
            id="sidebar-report-btn"
          >
            <Plus size={16} />
            <span>Report a Problem</span>
          </button>
        </div>

        {/* Navigation List */}
        <nav style={{ padding: '0.75rem 0.75rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#94A3B8', padding: '0.25rem 0.5rem' }}>
            Citizen Services
          </span>

          {navItems.slice(0, 3).map(item => {
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
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  backgroundColor: isActive ? '#EFF6FF' : 'transparent',
                  color: isActive ? '#2563EB' : '#334155',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.85rem',
                  border: isActive ? '1px solid #BFDBFE' : '1px solid transparent',
                  textAlign: 'left',
                  width: '100%'
                }}
                className="sidebar-nav-btn"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <Icon
                    size={17}
                    style={{
                      color: isActive ? '#2563EB' : '#64748B'
                    }}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '0.1rem 0.45rem',
                      borderRadius: '9999px',
                      backgroundColor: '#F1F5F9',
                      color: '#475569',
                      border: '1px solid #E2E8F0'
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div style={{ height: '1px', backgroundColor: 'var(--border-light)', margin: '0.5rem 0' }} />

          <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#94A3B8', padding: '0.25rem 0.5rem' }}>
            Municipal & Insights
          </span>

          {navItems.slice(3).map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id || (item.id === 'department' && (activeTab === 'department' || activeTab === 'department-login'));
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'department') {
                    if (storageService.isStaffAuthenticated()) {
                      setActiveTab('department');
                    } else {
                      setActiveTab('department-login');
                    }
                  } else {
                    setActiveTab(item.id);
                  }
                  setIsSidebarOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  backgroundColor: isActive ? '#EFF6FF' : 'transparent',
                  color: isActive ? '#2563EB' : '#334155',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.85rem',
                  border: isActive ? '1px solid #BFDBFE' : '1px solid transparent',
                  textAlign: 'left',
                  width: '100%'
                }}
                className="sidebar-nav-btn"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <Icon
                    size={17}
                    style={{
                      color: isActive ? '#2563EB' : '#64748B'
                    }}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '0.1rem 0.45rem',
                      borderRadius: '9999px',
                      backgroundColor: item.badgeType === 'blue' ? '#DBEAFE' : '#F1F5F9',
                      color: item.badgeType === 'blue' ? '#1E40AF' : '#64748B',
                      border: item.badgeType === 'blue' ? '1px solid #93C5FD' : '1px solid #E2E8F0'
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
                    if (storageService.isStaffAuthenticated()) {
                      setActiveTab('department');
                    } else {
                      setActiveTab('department-login');
                    }
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
                  Inspect in Staff Queue <ChevronRight size={12} />
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
            <span style={{ fontWeight: 600, color: '#334155' }}>CommunityPulse AI</span>
            <p>{totalCount} reports logged locally in Guntur.</p>
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
