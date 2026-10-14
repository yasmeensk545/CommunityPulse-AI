import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar.jsx';
import { Sidebar } from './components/Sidebar.jsx';
import { CitizenHomeView } from './components/CitizenHomeView.jsx';
import { TrackReportView } from './components/TrackReportView.jsx';
import { DepartmentLoginView } from './components/DepartmentLoginView.jsx';
import { DepartmentDashboardView } from './components/DepartmentDashboardView.jsx';
import { IssueDirectory } from './components/IssueDirectory.jsx';
import { AnalyticsView } from './components/AnalyticsView.jsx';
import { InsightsView } from './components/InsightsView.jsx';
import { AdminPortalView } from './components/AdminPortalView.jsx';
import { ReportFormModal } from './components/ReportFormModal.jsx';
import { IssueDetailModal } from './components/IssueDetailModal.jsx';
import { SettingsModal } from './components/SettingsModal.jsx';
import { DemoGuideModal } from './components/DemoGuideModal.jsx';
import { Toast } from './components/Toast.jsx';
import { storageService } from './services/storage.js';

// Route pathname mapping
const ROUTE_MAP = {
  home: '/',
  track: '/track',
  'department-login': '/department-login',
  department: '/department',
  directory: '/directory',
  analytics: '/analytics',
  insights: '/insights',
  admin: '/admin'
};

function getTabFromPathname(pathname) {
  const clean = (pathname || '').toLowerCase().replace(/\/$/, '') || '/';
  if (clean === '/track') return 'track';
  if (clean === '/report') return 'home'; // /report opens home with report modal
  if (clean === '/department-login') return 'department-login';
  if (clean === '/department') {
    return storageService.isStaffAuthenticated() ? 'department' : 'department-login';
  }
  if (clean === '/directory' || clean === '/issues') return 'directory';
  if (clean === '/analytics') return 'analytics';
  if (clean === '/insights') return 'insights';
  if (clean === '/admin') return 'admin';
  return 'home';
}

export default function App() {
  // Initialize route from current window.location.pathname
  const [activeTab, setActiveTabState] = useState(() => {
    if (typeof window !== 'undefined') {
      return getTabFromPathname(window.location.pathname);
    }
    return 'home';
  });

  const [reports, setReports] = useState(() => storageService.getReports());
  const [selectedReport, setSelectedReport] = useState(null);
  const [trackingReportId, setTrackingReportId] = useState('');
  const [reportModalCategory, setReportModalCategory] = useState('Road Damage');

  // Modals state
  const [isReportModalOpen, setIsReportModalOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname.toLowerCase().startsWith('/report');
    }
    return false;
  });
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isDemoGuideOpen, setIsDemoGuideOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Toast notifications state
  const [toasts, setToasts] = useState([]);

  // URL synchronization helper
  const setActiveTab = useCallback((tab, pushUrl = true) => {
    // Authentication guard for department
    if (tab === 'department' && !storageService.isStaffAuthenticated()) {
      setActiveTabState('department-login');
      if (pushUrl && typeof window !== 'undefined') {
        window.history.pushState(null, '', '/department-login');
      }
      return;
    }

    setActiveTabState(tab);
    if (pushUrl && typeof window !== 'undefined') {
      const targetPath = ROUTE_MAP[tab] || '/';
      if (window.location.pathname !== targetPath) {
        window.history.pushState(null, '', targetPath);
      }
    }
  }, []);

  // Sync browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const tab = getTabFromPathname(window.location.pathname);
      setActiveTabState(tab);
      if (window.location.pathname.toLowerCase().startsWith('/report')) {
        setIsReportModalOpen(true);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Trigger non-intrusive toast notification
  const triggerToast = useCallback((message, type = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newToast = { id, message, type };
    
    setToasts(prev => [...prev, newToast]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const handleDismissToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Open Report Modal with optional category preselection
  const handleOpenReportModal = (category = 'Road Damage') => {
    setReportModalCategory(category);
    setIsReportModalOpen(true);
  };

  // Create new report
  const handleReportSubmit = (newReportData) => {
    try {
      const saved = storageService.saveReport(newReportData);
      setReports(storageService.getReports());
      triggerToast(`Report #${saved.id} submitted! Dispatched to municipal services.`, 'success');
      setTrackingReportId(saved.id);
    } catch (err) {
      triggerToast(`Failed to save report: ${err.message}`, 'error');
    }
  };

  // Change report status (from details modal or direct update)
  const handleStatusChange = (id, newStatus) => {
    try {
      const updated = storageService.updateReport(id, { status: newStatus });
      setReports(storageService.getReports());
      setSelectedReport(updated);
      triggerToast(`Report #${id} updated to "${newStatus}".`, 'success');
    } catch (err) {
      triggerToast(`Status change failed: ${err.message}`, 'error');
    }
  };

  // Add internal note
  const handleAddNote = (id, text, author) => {
    try {
      const updated = storageService.addInternalNote(id, text, author);
      setReports(storageService.getReports());
      setSelectedReport(updated);
      triggerToast('Internal note saved to report audit log.', 'success');
    } catch (err) {
      triggerToast(`Failed to add note: ${err.message}`, 'error');
    }
  };

  // Department report update callback
  const handleDepartmentReportUpdated = (updatedReport) => {
    setReports(storageService.getReports());
    triggerToast(`Report #${updatedReport.id} status updated to "${updatedReport.status}".`, 'success');
  };

  // Staff Login Success
  const handleStaffLoginSuccess = (session) => {
    triggerToast(`Welcome, ${session.staffId}! Authorized department session active.`, 'success');
    setActiveTab('department');
  };

  // Staff Logout
  const handleStaffLogout = () => {
    storageService.logoutStaff();
    triggerToast('Logged out of department staff session.', 'info');
    setActiveTab('department-login');
  };

  // Delete report
  const handleDeleteReport = (id) => {
    try {
      storageService.deleteReport(id);
      setReports(storageService.getReports());
      setSelectedReport(null);
      triggerToast(`Report #${id} removed.`, 'info');
    } catch (err) {
      triggerToast(`Failed to delete report: ${err.message}`, 'error');
    }
  };

  // Reset to default sample data
  const handleResetData = () => {
    const fresh = storageService.resetToSampleData();
    setReports(fresh);
    setSelectedReport(null);
  };

  // Clear all data
  const handleClearData = () => {
    const empty = storageService.clearAllReports();
    setReports(empty);
    setSelectedReport(null);
  };

  // Import JSON data
  const handleImportData = (jsonString) => {
    const imported = storageService.importDataJSON(jsonString);
    setReports(imported);
    setSelectedReport(null);
  };

  // Select report and open detail modal
  const handleSelectReport = (report) => {
    const fresh = reports.find(r => r.id === report.id) || report;
    setSelectedReport(fresh);
  };

  return (
    <div className="app-layout">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        reports={reports}
        onOpenReportModal={() => handleOpenReportModal()}
        onResetData={() => {
          handleResetData();
          triggerToast('Restored sample Guntur neighbourhood reports.', 'success');
        }}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="main-content">
        {/* Top Navbar */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenReportModal={() => handleOpenReportModal()}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          onOpenDemoGuide={() => setIsDemoGuideOpen(true)}
        />

        {/* View Switcher Container */}
        <main className="content-container">
          {/* 1. Citizen Home Page (Public Access) */}
          {activeTab === 'home' && (
            <CitizenHomeView
              reports={reports}
              onOpenReportModal={(cat) => handleOpenReportModal(cat)}
              onNavigateToTrack={() => setActiveTab('track')}
              onSelectReport={handleSelectReport}
              onViewAllReports={() => setActiveTab('directory')}
            />
          )}

          {/* 2. Track Report View (Public Access) */}
          {activeTab === 'track' && (
            <TrackReportView
              reports={reports}
              initialReportId={trackingReportId}
            />
          )}

          {/* 3. Department Staff Login View */}
          {activeTab === 'department-login' && (
            <DepartmentLoginView
              onLoginSuccess={handleStaffLoginSuccess}
              onNavigateHome={() => setActiveTab('home')}
            />
          )}

          {/* 4. Protected Department Operations Dashboard */}
          {activeTab === 'department' && (
            <DepartmentDashboardView
              reports={reports}
              onReportUpdated={handleDepartmentReportUpdated}
              onLogout={handleStaffLogout}
              onNavigateHome={() => setActiveTab('home')}
            />
          )}

          {/* 5. All Community Issues Directory */}
          {activeTab === 'directory' && (
            <IssueDirectory
              reports={reports}
              onSelectReport={handleSelectReport}
              onOpenReportModal={() => handleOpenReportModal()}
            />
          )}

          {/* 6. Live Analytics */}
          {activeTab === 'analytics' && (
            <AnalyticsView
              reports={reports}
            />
          )}

          {/* 7. Community Insights */}
          {activeTab === 'insights' && (
            <InsightsView
              reports={reports}
            />
          )}

          {/* 8. Admin & Insights Portal (Legacy/Deep View) */}
          {activeTab === 'admin' && (
            <AdminPortalView
              reports={reports}
              onSelectReport={handleSelectReport}
              onOpenReportModal={() => handleOpenReportModal()}
              onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
            />
          )}
        </main>

        {/* Subtle Civic Footer */}
        <footer
          style={{
            marginTop: 'auto',
            padding: '1.25rem 2rem',
            borderTop: '1px solid var(--border-light)',
            backgroundColor: '#FFFFFF',
            fontSize: '0.75rem',
            color: '#64748B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}
        >
          <div>
            <strong style={{ color: '#0F172A' }}>CommunityPulse AI</strong> — <em>Report smarter. Respond faster. Build better communities.</em>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span>“AI for Better Living & Smarter Communities”</span>
            <button
              onClick={() => {
                if (storageService.isStaffAuthenticated()) {
                  setActiveTab('department');
                } else {
                  setActiveTab('department-login');
                }
              }}
              style={{ color: '#2563EB', fontWeight: 600, textDecoration: 'underline', fontSize: '0.75rem' }}
            >
              Department Staff Portal
            </button>
          </div>
        </footer>
      </div>

      {/* Modals & Dialogs */}
      <ReportFormModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmitSuccess={handleReportSubmit}
        onNavigateToTrack={(id) => {
          setTrackingReportId(id);
          setActiveTab('track');
        }}
        existingReports={reports}
        initialCategory={reportModalCategory}
      />

      <IssueDetailModal
        report={selectedReport}
        isOpen={Boolean(selectedReport)}
        onClose={() => setSelectedReport(null)}
        onStatusChange={handleStatusChange}
        onAddNote={handleAddNote}
        onDeleteReport={handleDeleteReport}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onDataReset={handleResetData}
        onDataClear={handleClearData}
        onDataImport={handleImportData}
        triggerToast={triggerToast}
      />

      <DemoGuideModal
        isOpen={isDemoGuideOpen}
        onClose={() => setIsDemoGuideOpen(false)}
      />

      {/* Non-intrusive Toast Notifications */}
      <Toast toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
}
// CommunityPulse AI - No Login Citizen, Privacy Safe Tracking, Protected Dept