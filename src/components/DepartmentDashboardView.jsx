import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  LogOut, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  MapPin, 
  Edit3, 
  X, 
  Eye, 
  Lock, 
  Layers 
} from 'lucide-react';
import { PriorityBadge, StatusBadge, CategoryBadge } from './common/Badge.jsx';
import { formatRelativeTime, truncate } from '../utils/formatters.js';
import { storageService, VALID_CATEGORIES, VALID_PRIORITIES } from '../services/storage.js';

const MUNICIPAL_DEPARTMENTS = [
  'Department of Transportation & Public Works',
  'Municipal Water & Sewer Authority',
  'Bureau of Street Lighting & Electrical Utilities',
  'Department of Sanitation & Waste Recovery',
  'Environmental Protection & Hazardous Waste Division',
  'Facilities & ADA Compliance Services',
  'Traffic Operations Center & Signal Engineering',
  'General Municipal Services'
];

const GUNTUR_LOCATIONS = [
  'All Guntur Wards',
  'Ward 12 - Guntur Central',
  'Ward 4 - Arundelpet, Guntur',
  'Ward 7 - Brodipet, Guntur',
  'Ward 18 - Old Guntur',
  'Ward 9 - Kothapet, Guntur',
  'Ward 2 - Collectorate, Guntur',
  'Ward 11 - Lodge Center, Guntur'
];

export function DepartmentDashboardView({
  reports = [],
  onReportUpdated,
  onLogout,
  onNavigateHome
}) {
  const staffSession = storageService.getStaffSession();

  // Selected Status Tab (Pending, In Progress, Resolved, All)
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Top Filters
  const [timeFilter, setTimeFilter] = useState('All Time'); // 'This Week' or 'All Time'
  const [locationFilter, setLocationFilter] = useState('All Guntur Wards');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Active Report for Status Update Modal
  const [editingReport, setEditingReport] = useState(null);
  const [currentTime] = useState(() => Date.now());

  // Status Counts
  const counts = useMemo(() => {
    return {
      all: reports.length,
      pending: reports.filter(r => r.status === 'Pending').length,
      inProgress: reports.filter(r => r.status === 'In Progress').length,
      resolved: reports.filter(r => r.status === 'Resolved').length
    };
  }, [reports]);

  // Filtered reports
  const filteredReports = useMemo(() => {
    const sevenDaysAgo = currentTime - 7 * 24 * 60 * 60 * 1000;

    return reports.filter(r => {
      // Status
      if (statusFilter !== 'All' && r.status !== statusFilter) return false;

      // Category
      if (categoryFilter !== 'All' && r.category !== categoryFilter) return false;

      // Priority
      if (priorityFilter !== 'All' && r.priority !== priorityFilter) return false;

      // Location / Ward
      if (locationFilter !== 'All Guntur Wards') {
        const matchesLoc = (r.ward && r.ward.toLowerCase().includes(locationFilter.toLowerCase())) ||
                           (r.locality && r.locality.toLowerCase().includes(locationFilter.toLowerCase()));
        if (!matchesLoc) return false;
      }

      // Time (This Week: last 7 days)
      if (timeFilter === 'This Week') {
        const reportDate = new Date(r.createdAt).getTime();
        if (reportDate < sevenDaysAgo) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches = 
          r.id.toLowerCase().includes(q) ||
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.locality.toLowerCase().includes(q) ||
          (r.publicNote && r.publicNote.toLowerCase().includes(q)) ||
          (r.aiAnalysis?.department && r.aiAnalysis.department.toLowerCase().includes(q));
        if (!matches) return false;
      }

      return true;
    });
  }, [reports, statusFilter, categoryFilter, priorityFilter, locationFilter, timeFilter, searchQuery, currentTime]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Header Bar */}
      <div
        className="cp-card"
        style={{
          padding: '1.25rem 1.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          borderLeft: '5px solid #2563EB'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              backgroundColor: '#EFF6FF',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(37, 99, 235, 0.15)'
            }}
          >
            <Building2 size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 className="heading-1" style={{ fontSize: '1.35rem', color: '#0F172A', margin: 0 }}>
                Municipal Department Operations
              </h1>
              <span
                style={{
                  backgroundColor: '#EFF6FF',
                  color: '#2563EB',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '0.15rem 0.55rem',
                  borderRadius: '9999px',
                  border: '1px solid #BFDBFE'
                }}
              >
                Guntur Civic Grid
              </span>
            </div>
            <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '0.2rem' }}>
              Authorized Staff: <strong style={{ color: '#0F172A' }}>{staffSession?.staffId || 'STAFF-01'}</strong> ({staffSession?.role || 'Operations Staff'})
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={onNavigateHome}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.8rem' }}
          >
            <span>Citizen View</span>
          </button>

          <button
            onClick={onLogout}
            className="btn btn-secondary btn-sm"
            style={{ color: '#DC2626', borderColor: '#FCA5A5', fontSize: '0.8rem' }}
            id="department-logout-btn"
          >
            <LogOut size={14} />
            <span>Staff Logout</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Status Filter Tabs + Right Report Content */}
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left Sidebar Status Filters */}
        <div className="cp-card" style={{ padding: '1.25rem', borderRadius: '14px' }}>
          <h2 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.85rem' }}>
            Status Queues
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {/* All Reports */}
            <button
              onClick={() => setStatusFilter('All')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                backgroundColor: statusFilter === 'All' ? '#EFF6FF' : 'transparent',
                color: statusFilter === 'All' ? '#2563EB' : '#334155',
                fontWeight: statusFilter === 'All' ? 700 : 500,
                fontSize: '0.84rem',
                textAlign: 'left',
                border: statusFilter === 'All' ? '1px solid #BFDBFE' : '1px solid transparent'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Layers size={15} />
                <span>All Issues</span>
              </div>
              <span style={{ fontSize: '0.75rem', padding: '0.1rem 0.45rem', borderRadius: '9999px', backgroundColor: '#F1F5F9', color: '#475569' }}>
                {counts.all}
              </span>
            </button>

            {/* Pending Tab */}
            <button
              onClick={() => setStatusFilter('Pending')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                backgroundColor: statusFilter === 'Pending' ? '#FEF3C7' : 'transparent',
                color: statusFilter === 'Pending' ? '#92400E' : '#334155',
                fontWeight: statusFilter === 'Pending' ? 700 : 500,
                fontSize: '0.84rem',
                textAlign: 'left',
                border: statusFilter === 'Pending' ? '1px solid #FCD34D' : '1px solid transparent'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#D97706' }}></span>
                <span>Pending</span>
              </div>
              <span style={{ fontSize: '0.75rem', padding: '0.1rem 0.45rem', borderRadius: '9999px', backgroundColor: '#FEF3C7', color: '#92400E', fontWeight: 700 }}>
                {counts.pending}
              </span>
            </button>

            {/* In Progress Tab */}
            <button
              onClick={() => setStatusFilter('In Progress')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                backgroundColor: statusFilter === 'In Progress' ? '#DBEAFE' : 'transparent',
                color: statusFilter === 'In Progress' ? '#1E40AF' : '#334155',
                fontWeight: statusFilter === 'In Progress' ? 700 : 500,
                fontSize: '0.84rem',
                textAlign: 'left',
                border: statusFilter === 'In Progress' ? '1px solid #93C5FD' : '1px solid transparent'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2563EB' }}></span>
                <span>In Progress</span>
              </div>
              <span style={{ fontSize: '0.75rem', padding: '0.1rem 0.45rem', borderRadius: '9999px', backgroundColor: '#DBEAFE', color: '#1E40AF', fontWeight: 700 }}>
                {counts.inProgress}
              </span>
            </button>

            {/* Resolved Tab */}
            <button
              onClick={() => setStatusFilter('Resolved')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                backgroundColor: statusFilter === 'Resolved' ? '#DCFCE7' : 'transparent',
                color: statusFilter === 'Resolved' ? '#166534' : '#334155',
                fontWeight: statusFilter === 'Resolved' ? 700 : 500,
                fontSize: '0.84rem',
                textAlign: 'left',
                border: statusFilter === 'Resolved' ? '1px solid #86EFAC' : '1px solid transparent'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#16A34A' }}></span>
                <span>Resolved</span>
              </div>
              <span style={{ fontSize: '0.75rem', padding: '0.1rem 0.45rem', borderRadius: '9999px', backgroundColor: '#DCFCE7', color: '#166534', fontWeight: 700 }}>
                {counts.resolved}
              </span>
            </button>
          </div>

          {/* Quick Notice */}
          <div style={{ marginTop: '1.5rem', padding: '0.75rem', borderRadius: '8px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', fontSize: '0.72rem', color: '#64748B' }}>
            <strong style={{ color: '#0F172A', display: 'block', marginBottom: '0.2rem' }}>Department Protocol:</strong>
            Updates saved here instantly update public tracking for citizens and maintain confidential internal staff logs.
          </div>
        </div>

        {/* Right Content Area: Filters + Table/List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Top Filter Bar */}
          <div
            className="cp-card"
            style={{
              padding: '1rem 1.25rem',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.75rem',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            {/* Search Input */}
            <div style={{ position: 'relative', minWidth: '220px', flex: 1 }}>
              <Search size={15} style={{ position: 'absolute', left: '10px', top: '11px', color: '#94A3B8' }} />
              <input
                type="text"
                placeholder="Search ticket #, title, notes, ward..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '32px', height: '36px', fontSize: '0.82rem' }}
              />
            </div>

            {/* Time Filter (This Week vs All Time) */}
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="form-select"
              style={{ width: 'auto', height: '36px', fontSize: '0.82rem', paddingRight: '2rem' }}
            >
              <option value="All Time">All Time</option>
              <option value="This Week">This Week (Last 7 Days)</option>
            </select>

            {/* Location / Ward Filter */}
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="form-select"
              style={{ width: 'auto', height: '36px', fontSize: '0.82rem', paddingRight: '2rem' }}
            >
              {GUNTUR_LOCATIONS.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="form-select"
              style={{ width: 'auto', height: '36px', fontSize: '0.82rem', paddingRight: '2rem' }}
            >
              <option value="All">All Categories</option>
              {VALID_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="form-select"
              style={{ width: 'auto', height: '36px', fontSize: '0.82rem', paddingRight: '2rem' }}
            >
              <option value="All">All Priorities</option>
              {VALID_PRIORITIES.map(pri => (
                <option key={pri} value={pri}>{pri}</option>
              ))}
            </select>
          </div>

          {/* Results Summary */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 0.25rem', fontSize: '0.78rem', color: '#64748B' }}>
            <span>Showing <strong>{filteredReports.length}</strong> reports matching criteria</span>
            {(searchQuery || statusFilter !== 'All' || timeFilter !== 'All Time' || locationFilter !== 'All Guntur Wards' || categoryFilter !== 'All' || priorityFilter !== 'All') && (
              <button
                onClick={() => {
                  setStatusFilter('All');
                  setTimeFilter('All Time');
                  setLocationFilter('All Guntur Wards');
                  setCategoryFilter('All');
                  setPriorityFilter('All');
                  setSearchQuery('');
                }}
                style={{ color: '#2563EB', fontWeight: 600, textDecoration: 'underline' }}
              >
                Reset All Filters
              </button>
            )}
          </div>

          {/* Table / List View */}
          {filteredReports.length === 0 ? (
            <div className="cp-card" style={{ padding: '3rem 1.5rem', textAlign: 'center', borderRadius: '14px' }}>
              <Layers size={36} style={{ color: '#94A3B8', margin: '0 auto 0.75rem' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#334155' }}>No Reports Found</h3>
              <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                No community issues match the selected status or filters.
              </p>
            </div>
          ) : (
            <div className="cp-card" style={{ padding: '0', borderRadius: '14px', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid var(--border-light)', color: '#475569', fontWeight: 700 }}>
                      <th style={{ padding: '0.85rem 1rem' }}>Ticket ID & Date</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Category & Issue</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Location / Ward</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Priority</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Assigned Department & AI Action</th>
                      <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReports.map(report => (
                      <tr 
                        key={report.id}
                        style={{ borderBottom: '1px solid var(--border-light)', transition: 'background-color 150ms' }}
                        className="table-row-hover"
                      >
                        {/* ID & Date */}
                        <td style={{ padding: '0.85rem 1rem', verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                          <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#2563EB', fontSize: '0.85rem' }}>
                            {report.id}
                          </span>
                          <span style={{ display: 'block', fontSize: '0.72rem', color: '#94A3B8', marginTop: '2px' }}>
                            {formatRelativeTime(report.createdAt)}
                          </span>
                        </td>

                        {/* Category & Title */}
                        <td style={{ padding: '0.85rem 1rem', verticalAlign: 'top', maxWidth: '240px' }}>
                          <div style={{ marginBottom: '0.25rem' }}>
                            <CategoryBadge category={report.category} />
                          </div>
                          <strong style={{ display: 'block', color: '#0F172A', fontSize: '0.86rem', lineHeight: 1.3 }}>
                            {report.title}
                          </strong>
                          <p style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px', lineHeight: 1.35 }}>
                            {truncate(report.description, 80)}
                          </p>
                        </td>

                        {/* Location */}
                        <td style={{ padding: '0.85rem 1rem', verticalAlign: 'top' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#334155', fontWeight: 500 }}>
                            <MapPin size={13} style={{ color: '#0D9488', flexShrink: 0 }} />
                            <span>{report.locality}</span>
                          </div>
                          {report.ward && (
                            <span style={{ display: 'block', fontSize: '0.72rem', color: '#64748B', marginTop: '2px' }}>
                              {report.ward}
                            </span>
                          )}
                        </td>

                        {/* Priority */}
                        <td style={{ padding: '0.85rem 1rem', verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                          <PriorityBadge priority={report.priority} />
                        </td>

                        {/* Status */}
                        <td style={{ padding: '0.85rem 1rem', verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                          <StatusBadge status={report.status} />
                        </td>

                        {/* Assigned Department & AI Action */}
                        <td style={{ padding: '0.85rem 1rem', verticalAlign: 'top', maxWidth: '280px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.2rem' }}>
                            <Building2 size={13} style={{ color: '#2563EB', flexShrink: 0 }} />
                            <strong style={{ fontSize: '0.78rem', color: '#1E293B' }}>
                              {report.aiAnalysis?.department || 'General Municipal Services'}
                            </strong>
                          </div>
                          <span style={{ fontSize: '0.73rem', color: '#475569', display: 'block', lineHeight: 1.3 }}>
                            ⚡ {truncate(report.aiAnalysis?.recommendedAction || 'Inspect and assess on-site.', 75)}
                          </span>

                          {/* Citizen Public Note Preview if present */}
                          {report.publicNote && (
                            <div style={{ marginTop: '0.4rem', fontSize: '0.7rem', color: '#1E40AF', backgroundColor: '#EFF6FF', padding: '0.2rem 0.45rem', borderRadius: '4px', border: '1px solid #BFDBFE' }}>
                              <strong>Public Note:</strong> {truncate(report.publicNote, 60)}
                            </div>
                          )}
                        </td>

                        {/* Action Button */}
                        <td style={{ padding: '0.85rem 1rem', verticalAlign: 'top', textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <button
                            onClick={() => setEditingReport(report)}
                            className="btn btn-blue btn-sm"
                            style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem', borderRadius: '8px' }}
                            id={`update-status-btn-${report.id}`}
                          >
                            <Edit3 size={13} />
                            <span>Update Status & Notes</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status Update Modal (CRITICAL: Blue Public Note & Yellow Internal Note) */}
      {editingReport && (
        <StatusUpdateModal
          report={editingReport}
          onClose={() => setEditingReport(null)}
          onSave={(updated) => {
            onReportUpdated(updated);
            setEditingReport(null);
          }}
        />
      )}
    </div>
  );
}

/**
 * Status Update Modal Component
 * Strictly enforces Blue Public Note (citizen-visible) vs Yellow Internal Note (staff-only),
 * with confirmation before marking Resolved.
 */
function StatusUpdateModal({ report, onClose, onSave }) {
  const staffSession = storageService.getStaffSession();
  const staffAuthor = staffSession ? `${staffSession.staffId} (${staffSession.role})` : 'Municipal Duty Officer';

  const [selectedStatus, setSelectedStatus] = useState(report.status || 'Pending');
  const [selectedDept, setSelectedDept] = useState(report.aiAnalysis?.department || 'Department of Transportation & Public Works');
  const [publicNote, setPublicNote] = useState(report.publicNote || '');
  const [newInternalNote, setNewInternalNote] = useState('');
  
  // Confirmation state before resolving
  const [confirmResolved, setConfirmResolved] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSave = () => {
    setErrorMsg('');

    // If changing to Resolved, enforce confirmation checkbox
    if (selectedStatus === 'Resolved' && !confirmResolved) {
      setErrorMsg('Please confirm that this issue has been inspected and verified as resolved on site.');
      return;
    }

    try {
      const updated = storageService.updateReportStatus(
        report.id,
        selectedStatus,
        publicNote,
        newInternalNote,
        staffAuthor,
        selectedDept
      );
      onSave(updated);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update report.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-dialog modal-dialog-large" style={{ maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}>
        {/* Modal Header */}
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#2563EB', fontSize: '0.9rem' }}>
                #{report.id}
              </span>
              <CategoryBadge category={report.category} />
              <PriorityBadge priority={report.priority} />
            </div>
            <h2 className="heading-2" style={{ fontSize: '1.2rem', color: '#0F172A' }}>
              Update Issue Status & Notes
            </h2>
            <p className="text-muted" style={{ fontSize: '0.78rem' }}>
              {report.title} — <MapPin size={12} style={{ display: 'inline' }} /> {report.locality}
            </p>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-sm" aria-label="Close dialog">
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {errorMsg && (
            <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', borderRadius: '8px', padding: '0.75rem 1rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. Status Selection */}
          <div>
            <label className="form-label" style={{ marginBottom: '0.4rem' }}>
              1. Issue Status <span className="required">*</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
              {/* Pending */}
              <button
                type="button"
                onClick={() => {
                  setSelectedStatus('Pending');
                  setConfirmResolved(false);
                }}
                style={{
                  padding: '0.75rem',
                  borderRadius: '10px',
                  border: selectedStatus === 'Pending' ? '2px solid #D97706' : '1px solid var(--border-light)',
                  backgroundColor: selectedStatus === 'Pending' ? '#FEF3C7' : '#FFFFFF',
                  color: selectedStatus === 'Pending' ? '#92400E' : '#334155',
                  fontWeight: selectedStatus === 'Pending' ? 700 : 500,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#D97706' }}></span>
                <span>Pending</span>
              </button>

              {/* In Progress */}
              <button
                type="button"
                onClick={() => {
                  setSelectedStatus('In Progress');
                  setConfirmResolved(false);
                }}
                style={{
                  padding: '0.75rem',
                  borderRadius: '10px',
                  border: selectedStatus === 'In Progress' ? '2px solid #2563EB' : '1px solid var(--border-light)',
                  backgroundColor: selectedStatus === 'In Progress' ? '#DBEAFE' : '#FFFFFF',
                  color: selectedStatus === 'In Progress' ? '#1E40AF' : '#334155',
                  fontWeight: selectedStatus === 'In Progress' ? 700 : 500,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2563EB' }}></span>
                <span>In Progress</span>
              </button>

              {/* Resolved */}
              <button
                type="button"
                onClick={() => setSelectedStatus('Resolved')}
                style={{
                  padding: '0.75rem',
                  borderRadius: '10px',
                  border: selectedStatus === 'Resolved' ? '2px solid #16A34A' : '1px solid var(--border-light)',
                  backgroundColor: selectedStatus === 'Resolved' ? '#DCFCE7' : '#FFFFFF',
                  color: selectedStatus === 'Resolved' ? '#166534' : '#334155',
                  fontWeight: selectedStatus === 'Resolved' ? 700 : 500,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#16A34A' }}></span>
                <span>Resolved</span>
              </button>
            </div>
          </div>

          {/* Confirmation Checkbox if Resolved */}
          {selectedStatus === 'Resolved' && (
            <div
              style={{
                backgroundColor: '#F0FDF4',
                border: '1px solid #86EFAC',
                borderRadius: '10px',
                padding: '0.85rem 1rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem'
              }}
            >
              <input
                type="checkbox"
                id="confirm-resolved-checkbox"
                checked={confirmResolved}
                onChange={(e) => setConfirmResolved(e.target.checked)}
                style={{ marginTop: '0.2rem', cursor: 'pointer', width: '16px', height: '16px' }}
              />
              <label htmlFor="confirm-resolved-checkbox" style={{ fontSize: '0.82rem', color: '#166534', cursor: 'pointer' }}>
                <strong>Staff On-Site Verification:</strong> I confirm that this civic hazard has been inspected and verified as fully repaired or restored by municipal field teams.
              </label>
            </div>
          )}

          {/* 2. Department Assignment Correction */}
          <div>
            <label className="form-label" htmlFor="dept-select">
              2. Assigned Department / Work Division:
            </label>
            <select
              id="dept-select"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="form-select"
              style={{ fontSize: '0.86rem' }}
            >
              {MUNICIPAL_DEPARTMENTS.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            <p className="form-hint">
              You can correct department assignment if AI recommended another work group.
            </p>
          </div>

          {/* 3. Blue Section: Citizen Will See — Public Note */}
          <div className="public-note-section">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <Eye size={18} style={{ color: '#2563EB' }} />
              <strong style={{ fontSize: '0.88rem', color: '#1E40AF' }}>
                Citizen will see — Public Note
              </strong>
              <span style={{ fontSize: '0.72rem', backgroundColor: '#DBEAFE', color: '#1E40AF', padding: '0.1rem 0.45rem', borderRadius: '4px', fontWeight: 600 }}>
                Public on /track
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#3B82F6', marginBottom: '0.65rem' }}>
              Write clear, reassuring updates visible to ordinary citizens checking ticket progress.
            </p>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="e.g. Emergency valve crew on-site at 09:40. Section isolated. Heavy excavator en route for repair."
              value={publicNote}
              onChange={(e) => setPublicNote(e.target.value)}
              style={{ backgroundColor: '#FFFFFF', fontSize: '0.85rem' }}
            />
          </div>

          {/* 4. Yellow Section: Staff Only — Internal Note */}
          <div className="internal-note-section">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <Lock size={18} style={{ color: '#D97706' }} />
              <strong style={{ fontSize: '0.88rem', color: '#92400E' }}>
                Staff only — Internal Note
              </strong>
              <span style={{ fontSize: '0.72rem', backgroundColor: '#FEF3C7', color: '#92400E', padding: '0.1rem 0.45rem', borderRadius: '4px', fontWeight: 600 }}>
                Confidential / Staff Only
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#B45309', marginBottom: '0.65rem' }}>
              Internal operational notes, contractor work orders, telemetry traces, or police coordination. <strong>Never revealed to citizens.</strong>
            </p>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="e.g. Contractor WO-991 alerted. Trenching permit approved by road superintendent."
              value={newInternalNote}
              onChange={(e) => setNewInternalNote(e.target.value)}
              style={{ backgroundColor: '#FFFFFF', fontSize: '0.85rem' }}
            />

            {/* Existing Internal Notes Log */}
            {report.internalNotes && report.internalNotes.length > 0 && (
              <div style={{ marginTop: '0.85rem', paddingTop: '0.85rem', borderTop: '1px solid #FEF08A' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#92400E', display: 'block', marginBottom: '0.4rem' }}>
                  Previous Internal Notes ({report.internalNotes.length}):
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '140px', overflowY: 'auto' }}>
                  {report.internalNotes.map(n => (
                    <div key={n.id} style={{ backgroundColor: '#FFFFFF', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #FEF08A', fontSize: '0.76rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#78350F', fontWeight: 600, marginBottom: '2px', fontSize: '0.72rem' }}>
                        <span>{n.author}</span>
                        <span>{formatRelativeTime(n.timestamp)}</span>
                      </div>
                      <p style={{ color: '#334155', margin: 0 }}>{n.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', backgroundColor: '#F8FAFC' }}>
          <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ padding: '0.5rem 1rem' }}>
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="btn btn-blue btn-sm"
            style={{ padding: '0.5rem 1.25rem', fontWeight: 600 }}
            id="modal-save-status-btn"
          >
            <CheckCircle2 size={15} />
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
}
