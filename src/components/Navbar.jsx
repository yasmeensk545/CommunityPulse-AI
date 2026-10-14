import React from 'react';
import { 
  Activity, 
  Plus, 
  Menu, 
  Sparkles,
  HelpCircle,
  Search,
  Home,
  List,
  Building2,
  BarChart3,
  Lock
} from 'lucide-react';
import { storageService } from '../services/storage.js';

export function Navbar({
  activeTab,
  setActiveTab,
  onOpenReportModal,
  isSidebarOpen,
  setIsSidebarOpen,
  onOpenDemoGuide
}) {
  const hasApiKey = Boolean(storageService.getApiKey());
  const isStaffLoggedIn = storageService.isStaffAuthenticated();

  return (
    <header className="top-navbar">
      {/* Left: Mobile Toggle & Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          aria-label="Toggle navigation menu"
          style={{ display: 'none', padding: '0.4rem' }}
          id="mobile-menu-btn"
        >
          <Menu size={18} />
        </button>

        <div 
          onClick={() => setActiveTab('home')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}
          title="Return to Citizen Home"
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '9px',
              background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 2px 6px rgba(37, 99, 235, 0.3)'
            }}
          >
            <Activity size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontWeight: 800, fontSize: '1.15rem', color: '#0F172A', letterSpacing: '-0.02em' }}>
                CommunityPulse
              </span>
              <span
                style={{
                  background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                  color: '#FFFFFF',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  padding: '0.15rem 0.4rem',
                  borderRadius: '4px',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase'
                }}
              >
                AI
              </span>
            </div>
            <p className="text-muted" style={{ fontSize: '0.72rem', display: 'none', marginTop: '-2px' }} id="navbar-tagline">
              Smarter Communities. Better Living.
            </p>
          </div>
        </div>
      </div>

      {/* Middle: Desktop Navigation Pills */}
      <nav style={{ display: 'none', alignItems: 'center', gap: '0.35rem' }} id="desktop-nav-pills">
        <button
          onClick={() => setActiveTab('home')}
          className="btn btn-sm"
          style={{
            backgroundColor: activeTab === 'home' ? '#EFF6FF' : 'transparent',
            color: activeTab === 'home' ? '#2563EB' : '#475569',
            fontWeight: activeTab === 'home' ? 700 : 500,
            borderRadius: '8px',
            fontSize: '0.825rem'
          }}
        >
          <Home size={15} />
          <span>Home</span>
        </button>

        <button
          onClick={() => setActiveTab('track')}
          className="btn btn-sm"
          style={{
            backgroundColor: activeTab === 'track' ? '#EFF6FF' : 'transparent',
            color: activeTab === 'track' ? '#2563EB' : '#475569',
            fontWeight: activeTab === 'track' ? 700 : 500,
            borderRadius: '8px',
            fontSize: '0.825rem'
          }}
        >
          <Search size={15} />
          <span>Track Report</span>
        </button>

        <button
          onClick={() => setActiveTab('directory')}
          className="btn btn-sm"
          style={{
            backgroundColor: activeTab === 'directory' ? '#EFF6FF' : 'transparent',
            color: activeTab === 'directory' ? '#2563EB' : '#475569',
            fontWeight: activeTab === 'directory' ? 700 : 500,
            borderRadius: '8px',
            fontSize: '0.825rem'
          }}
        >
          <List size={15} />
          <span>Issues</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className="btn btn-sm"
          style={{
            backgroundColor: activeTab === 'analytics' ? '#EFF6FF' : 'transparent',
            color: activeTab === 'analytics' ? '#2563EB' : '#475569',
            fontWeight: activeTab === 'analytics' ? 700 : 500,
            borderRadius: '8px',
            fontSize: '0.825rem'
          }}
        >
          <BarChart3 size={15} />
          <span>Analytics</span>
        </button>

        {/* Protected Department Staff Portal */}
        <button
          onClick={() => {
            if (isStaffLoggedIn) {
              setActiveTab('department');
            } else {
              setActiveTab('department-login');
            }
          }}
          className="btn btn-sm"
          style={{
            backgroundColor: (activeTab === 'department' || activeTab === 'department-login') ? '#1E293B' : '#F1F5F9',
            color: (activeTab === 'department' || activeTab === 'department-login') ? '#FFFFFF' : '#334155',
            fontWeight: 600,
            borderRadius: '8px',
            fontSize: '0.78rem',
            marginLeft: '0.5rem',
            border: '1px solid #CBD5E1'
          }}
          title={isStaffLoggedIn ? 'Department Management Dashboard' : 'Authorized Staff Login Required'}
          id="navbar-department-btn"
        >
          {isStaffLoggedIn ? <Building2 size={14} /> : <Lock size={14} />}
          <span>{isStaffLoggedIn ? 'Department Queue' : 'Staff Portal'}</span>
        </button>
      </nav>

      {/* Right: Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        {/* Help / Guide */}
        <button
          onClick={onOpenDemoGuide}
          className="btn btn-secondary btn-sm"
          title="About CommunityPulse AI & How It Works"
          style={{ padding: '0.4rem 0.6rem' }}
          aria-label="Demo Guide"
        >
          <HelpCircle size={16} />
        </button>

        {/* AI Engine Status Pill (subtle) */}
        <span
          title={hasApiKey ? 'Google Gemini 2.5 Flash Connected' : 'Local Heuristic Decision Engine Active'}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            fontSize: '0.72rem',
            padding: '0.25rem 0.55rem',
            borderRadius: '6px',
            backgroundColor: hasApiKey ? '#F0FDF4' : '#EFF6FF',
            color: hasApiKey ? '#166534' : '#1D4ED8',
            border: `1px solid ${hasApiKey ? '#BBF7D0' : '#BFDBFE'}`
          }}
          id="navbar-ai-badge"
        >
          <Sparkles size={12} />
          <span>{hasApiKey ? 'Gemini AI' : 'Offline AI'}</span>
        </span>

        {/* Primary CTA: Blue Report a Problem */}
        <button
          onClick={onOpenReportModal}
          className="btn btn-blue"
          style={{ fontWeight: 700, padding: '0.55rem 1.1rem', borderRadius: '10px' }}
          id="btn-report-issue-main"
        >
          <Plus size={16} />
          <span>Report a Problem</span>
        </button>
      </div>

      <style>{`
        @media (min-width: 640px) {
          #navbar-tagline {
            display: block !important;
          }
        }
        @media (min-width: 860px) {
          #desktop-nav-pills {
            display: flex !important;
          }
        }
        @media (max-width: 768px) {
          #mobile-menu-btn {
            display: inline-flex !important;
          }
        }
        @media (max-width: 520px) {
          #navbar-ai-badge {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
}
