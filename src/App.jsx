import React, { useState, useCallback } from 'react';
import { Navbar } from './components/Navbar.jsx';
import { Sidebar } from './components/Sidebar.jsx';
import { DashboardView } from './components/DashboardView.jsx';
import { IssueDirectory } from './components/IssueDirectory.jsx';
import { AnalyticsView } from './components/AnalyticsView.jsx';
import { InsightsView } from './components/InsightsView.jsx';
import { ReportFormModal } from './components/ReportFormModal.jsx';
import { IssueDetailModal } from './components/IssueDetailModal.jsx';
import { SettingsModal } from './components/SettingsModal.jsx';
import { DemoGuideModal } from './components/DemoGuideModal.jsx';
import { Toast } from './components/Toast.jsx';
import { storageService } from './services/storage.js';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [reports, setReports] = useState(() => storageService.getReports());
  const [selectedReport, setSelectedReport] = useState(null);

  // Modals state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isDemoGuideOpen, setIsDemoGuideOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Toast notifications state
  const [toasts, setToasts] = useState([]);

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

  // Create new report
  const handleReportSubmit = (newReportData) => {
    try {
      const saved = storageService.saveReport(newReportData);
      setReports(storageService.getReports());
      triggerToast(`Civic report #${saved.id} submitted and prioritized!`, 'success');
      setIsReportModalOpen(false);
    } catch (err) {
      triggerToast(`Failed to save report: ${err.message}`, 'error');
    }
  };

  // Change report status
  const handleStatusChange = (id, newStatus) => {
    try {
      const updated = storageService.updateReport(id, { status: newStatus });
      setReports(storageService.getReports());
      setSelectedReport(updated);
      triggerToast(`Report #${id} updated to status "${newStatus}".`, 'success');
    } catch (err) {
      triggerToast(`Status change failed: ${err.message}`, 'error');
    }
  };

  // Add resolution/inspection note
  const handleAddNote = (id, text, author) => {
    try {
      const updated = storageService.addResolutionNote(id, text, author);
      setReports(storageService.getReports());
      setSelectedReport(updated);
      triggerToast('Inspection note posted to report timeline.', 'success');
    } catch (err) {
      triggerToast(`Failed to add note: ${err.message}`, 'error');
    }
  };

  // Delete report
  const handleDeleteReport = (id) => {
    try {
      storageService.deleteReport(id);
      setReports(storageService.getReports());
      setSelectedReport(null);
      triggerToast(`Report #${id} removed from civic queue.`, 'info');
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

  // Select report and open modal
  const handleSelectReport = (report) => {
    // Refresh latest version from current reports array
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
        onResetData={() => {
          handleResetData();
          triggerToast('Reset to standard sample community reports.', 'success');
        }}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="main-content">
        {/* Top Navbar */}
        <Navbar
          onOpenReportModal={() => setIsReportModalOpen(true)}
          onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          onOpenDemoGuide={() => setIsDemoGuideOpen(true)}
        />

        {/* View Switcher Container */}
        <main className="content-container">
          {activeTab === 'dashboard' && (
            <DashboardView
              reports={reports}
              onSelectReport={handleSelectReport}
              onOpenReportModal={() => setIsReportModalOpen(true)}
              onViewAllReports={() => setActiveTab('directory')}
              onViewAnalytics={() => setActiveTab('analytics')}
            />
          )}

          {activeTab === 'directory' && (
            <IssueDirectory
              reports={reports}
              onSelectReport={handleSelectReport}
              onOpenReportModal={() => setIsReportModalOpen(true)}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView reports={reports} />
          )}

          {activeTab === 'insights' && (
            <InsightsView reports={reports} />
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
            <span>Built for “AI for Better Living & Smarter Communities”</span>
            <span style={{ color: '#0D9488', fontWeight: 600 }}>Demo Storage Tier</span>
          </div>
        </footer>
      </div>

      {/* Modals & Dialogs */}
      <ReportFormModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmitSuccess={handleReportSubmit}
        existingReports={reports}
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
