import React from 'react';
import { 
  Activity, 
  Plus, 
  Menu, 
  Key, 
  Sparkles,
  HelpCircle,
  Database
} from 'lucide-react';
import { storageService } from '../services/storage.js';

export function Navbar({
  onOpenReportModal,
  onOpenSettingsModal,
  isSidebarOpen,
  setIsSidebarOpen,
  onOpenDemoGuide
}) {
  const hasApiKey = Boolean(storageService.getApiKey());

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

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '9px',
              background: 'linear-gradient(135deg, #0D9488 0%, #0F172A 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 2px 6px rgba(13, 148, 136, 0.3)'
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
                  background: 'linear-gradient(135deg, #0D9488 0%, #14B8A6 100%)',
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
              Report smarter. Respond faster. Build better communities.
            </p>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* AI Engine Status Pill */}
        <button
          onClick={onOpenSettingsModal}
          className="btn btn-secondary btn-sm"
          title={hasApiKey ? 'Gemini API Active - Click to manage' : 'Local Heuristics Active - Click to configure Gemini API Key'}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.75rem',
            padding: '0.35rem 0.65rem'
          }}
        >
          {hasApiKey ? (
            <>
              <Sparkles size={14} style={{ color: '#16A34A' }} />
              <span style={{ color: '#166534', fontWeight: 600 }}>Gemini AI Ready</span>
            </>
          ) : (
            <>
              <Key size={14} style={{ color: '#0D9488' }} />
              <span style={{ color: '#0F766E', fontWeight: 500 }}>Local AI Engine</span>
            </>
          )}
        </button>

        {/* Storage / Data Settings */}
        <button
          onClick={onOpenSettingsModal}
          className="btn btn-secondary btn-sm"
          title="Data Storage & Sample Controls"
          style={{ padding: '0.4rem 0.6rem' }}
          aria-label="Storage Settings"
        >
          <Database size={16} />
        </button>

        {/* Help / Guide */}
        <button
          onClick={onOpenDemoGuide}
          className="btn btn-secondary btn-sm"
          title="About CommunityPulse AI & Challenge Alignment"
          style={{ padding: '0.4rem 0.6rem' }}
          aria-label="Demo Information"
        >
          <HelpCircle size={16} />
        </button>

        {/* Primary CTA: Report Issue */}
        <button
          onClick={onOpenReportModal}
          className="btn btn-primary"
          style={{ fontWeight: 600 }}
          id="btn-report-issue-main"
        >
          <Plus size={16} />
          <span>Report an Issue</span>
        </button>
      </div>

      <style>{`
        @media (min-width: 640px) {
          #navbar-tagline {
            display: block !important;
          }
        }
        @media (max-width: 768px) {
          #mobile-menu-btn {
            display: inline-flex !important;
          }
        }
      `}</style>
    </header>
  );
}
