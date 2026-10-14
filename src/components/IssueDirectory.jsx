import React, { useState, useMemo } from 'react';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Eye, 
  X, 
  RotateCcw,
  LayoutGrid,
  List,
  Plus,
  AlertCircle
} from 'lucide-react';
import { VALID_CATEGORIES, VALID_PRIORITIES, VALID_STATUSES } from '../services/storage.js';
import { PriorityBadge, StatusBadge, CategoryBadge } from './common/Badge.jsx';
import { formatRelativeTime, truncate } from '../utils/formatters.js';

export function IssueDirectory({
  reports = [],
  onSelectReport,
  onOpenReportModal
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, priority_desc, priority_asc
  const [viewMode, setViewMode] = useState('grid'); // grid, table

  // Filter and sort logic
  const filteredReports = useMemo(() => {
    return reports.filter(item => {
      // Search text match
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const matchesTitle = item.title?.toLowerCase().includes(query);
        const matchesDesc = item.description?.toLowerCase().includes(query);
        const matchesLoc = item.locality?.toLowerCase().includes(query);
        const matchesId = item.id?.toLowerCase().includes(query);
        const matchesDept = item.aiAnalysis?.department?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesLoc && !matchesId && !matchesDept) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) {
        return false;
      }

      // Priority filter
      if (selectedPriority !== 'ALL' && item.priority !== selectedPriority) {
        return false;
      }

      // Status filter
      if (selectedStatus !== 'ALL' && item.status !== selectedStatus) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
      if (sortBy === 'priority_desc') {
        return (b.priorityScore || 0) - (a.priorityScore || 0);
      }
      if (sortBy === 'priority_asc') {
        return (a.priorityScore || 0) - (b.priorityScore || 0);
      }
      return 0;
    });
  }, [reports, searchTerm, selectedCategory, selectedPriority, selectedStatus, sortBy]);

  const hasActiveFilters = searchTerm !== '' || selectedCategory !== 'ALL' || selectedPriority !== 'ALL' || selectedStatus !== 'ALL';

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('ALL');
    setSelectedPriority('ALL');
    setSelectedStatus('ALL');
    setSortBy('newest');
  };

  return (
    <div>
      {/* Directory Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="heading-1">Community Issues Directory</h1>
          <p className="text-muted" style={{ marginTop: '0.2rem' }}>
            Comprehensive civic incident log with multi-criteria filtering and operational routing.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* View Mode Toggle */}
          <div
            style={{
              display: 'flex',
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border-light)',
              borderRadius: '8px',
              padding: '2px'
            }}
          >
            <button
              onClick={() => setViewMode('grid')}
              className="btn btn-sm"
              style={{
                backgroundColor: viewMode === 'grid' ? '#F0FDFA' : 'transparent',
                color: viewMode === 'grid' ? '#0F766E' : '#64748B',
                padding: '0.35rem 0.6rem',
                borderRadius: '6px'
              }}
              title="Card Grid View"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className="btn btn-sm"
              style={{
                backgroundColor: viewMode === 'table' ? '#F0FDFA' : 'transparent',
                color: viewMode === 'table' ? '#0F766E' : '#64748B',
                padding: '0.35rem 0.6rem',
                borderRadius: '6px'
              }}
              title="Detailed Table View"
            >
              <List size={16} />
            </button>
          </div>

          <button onClick={onOpenReportModal} className="btn btn-primary btn-sm">
            <Plus size={15} />
            <span>New Report</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div
        className="cp-card"
        style={{
          marginBottom: '1.5rem',
          padding: '1rem 1.25rem'
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
          {/* Search Box */}
          <div style={{ gridColumn: 'span 2', minWidth: '240px', position: 'relative' }}>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Search Reports</label>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: '#94A3B8' }} />
              <input
                type="text"
                placeholder="Search by keywords, ID, street name, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '32px', height: '38px', fontSize: '0.825rem' }}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  style={{ position: 'absolute', right: '10px', top: '10px', color: '#94A3B8' }}
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="form-select"
              style={{ height: '38px', fontSize: '0.825rem' }}
            >
              <option value="ALL">All Categories</option>
              {VALID_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Priority Level</label>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="form-select"
              style={{ height: '38px', fontSize: '0.825rem' }}
            >
              <option value="ALL">All Priorities</option>
              {VALID_PRIORITIES.map(pri => (
                <option key={pri} value={pri}>{pri}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Operational Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="form-select"
              style={{ height: '38px', fontSize: '0.825rem' }}
            >
              <option value="ALL">All Statuses</option>
              {VALID_STATUSES.map(stat => (
                <option key={stat} value={stat}>{stat}</option>
              ))}
            </select>
          </div>

          {/* Sort Control */}
          <div>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Sort Order</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="form-select"
              style={{ height: '38px', fontSize: '0.825rem' }}
            >
              <option value="newest">Newest First</option>
              <option value="priority_desc">Highest Priority First</option>
              <option value="priority_asc">Lowest Priority First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Filter Stats & Reset */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '0.85rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--border-light)',
            fontSize: '0.8rem',
            color: '#64748B'
          }}
        >
          <div>
            Showing <strong style={{ color: '#0F172A' }}>{filteredReports.length}</strong> of{' '}
            <strong style={{ color: '#0F172A' }}>{reports.length}</strong> total civic reports
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
            >
              <RotateCcw size={12} />
              <span>Clear Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Zero State */}
      {filteredReports.length === 0 ? (
        <div
          className="cp-card"
          style={{
            textAlign: 'center',
            padding: '4rem 1.5rem',
            borderRadius: '16px'
          }}
        >
          <AlertCircle size={44} style={{ color: '#94A3B8', margin: '0 auto 1rem' }} />
          <h3 className="heading-2">No Matching Civic Reports</h3>
          <p className="text-muted" style={{ maxWidth: '420px', margin: '0.5rem auto 1.5rem', fontSize: '0.875rem' }}>
            We could not find any reports matching your active filters or search terms. Try broadening your criteria.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
            <button onClick={resetFilters} className="btn btn-secondary btn-sm">
              <RotateCcw size={14} />
              <span>Reset All Filters</span>
            </button>
            <button onClick={onOpenReportModal} className="btn btn-primary btn-sm">
              <Plus size={14} />
              <span>File New Report</span>
            </button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        /* Card Grid Layout */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
          {filteredReports.map(report => (
            <div
              key={report.id}
              onClick={() => onSelectReport(report)}
              className="cp-card cp-card-interactive"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '1.2rem',
                backgroundColor: '#FFFFFF',
                borderLeft: report.priority === 'Critical' ? '4px solid #DC2626' : report.priority === 'High' ? '4px solid #EA580C' : '1px solid var(--border-light)'
              }}
            >
              <div>
                {/* Card Top Meta */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0D9488', fontFamily: 'monospace' }}>
                      #{report.id}
                    </span>
                    <CategoryBadge category={report.category} />
                    {report.isSample && <span className="badge badge-sample">Sample</span>}
                  </div>
                  <StatusBadge status={report.status} />
                </div>

                {/* Title */}
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.4rem', lineHeight: 1.3 }}>
                  {report.title}
                </h3>

                {/* Description */}
                <p style={{ fontSize: '0.825rem', color: '#475569', lineHeight: 1.45, marginBottom: '0.85rem' }}>
                  {truncate(report.description, 130)}
                </p>

                {/* AI Recommendation Summary */}
                {report.aiAnalysis && (
                  <div
                    style={{
                      padding: '0.6rem 0.75rem',
                      borderRadius: '8px',
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      marginBottom: '0.85rem',
                      fontSize: '0.75rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                      <span style={{ fontWeight: 600, color: '#0F766E' }}>
                        {report.aiAnalysis.department}
                      </span>
                      <span className="text-muted">
                        Score: <strong>{report.aiAnalysis.priorityScore}/100</strong>
                      </span>
                    </div>
                    <p style={{ color: '#334155', fontStyle: 'italic', fontSize: '0.73rem' }}>
                      "{truncate(report.aiAnalysis.recommendedAction, 90)}"
                    </p>
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid var(--border-light)',
                    fontSize: '0.75rem',
                    color: '#64748B'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <MapPin size={13} style={{ color: '#0D9488' }} />
                    <span style={{ fontWeight: 500, maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {report.locality}
                    </span>
                  </div>

                  <PriorityBadge priority={report.priority} />
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '0.5rem',
                    fontSize: '0.7rem',
                    color: '#94A3B8'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Calendar size={12} />
                    <span>{formatRelativeTime(report.createdAt)}</span>
                  </div>
                  <span style={{ color: '#0D9488', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                    Inspect Details <Eye size={12} />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View Layout */
        <div className="cp-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.825rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid var(--border-light)', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '0.85rem 1rem' }}>ID & Title</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Category</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Locality</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Priority</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Reported</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map(report => (
                  <tr
                    key={report.id}
                    onClick={() => onSelectReport(report)}
                    style={{
                      borderBottom: '1px solid var(--border-light)',
                      cursor: 'pointer',
                      transition: 'background-color 120ms ease'
                    }}
                    className="directory-table-row"
                  >
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0D9488', fontSize: '0.75rem' }}>
                          #{report.id}
                        </span>
                        <strong style={{ color: '#0F172A', fontWeight: 600 }}>{report.title}</strong>
                        {report.isSample && <span className="badge badge-sample" style={{ fontSize: '0.65rem' }}>Sample</span>}
                      </div>
                      <div className="text-muted" style={{ fontSize: '0.75rem', marginTop: '2px' }}>
                        {truncate(report.description, 70)}
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <CategoryBadge category={report.category} />
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: '#334155', fontWeight: 500 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <MapPin size={13} style={{ color: '#0D9488', flexShrink: 0 }} />
                        <span>{report.locality}</span>
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <PriorityBadge priority={report.priority} showScore={true} score={report.priorityScore} />
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <StatusBadge status={report.status} />
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: '#64748B', fontSize: '0.75rem' }}>
                      {formatRelativeTime(report.createdAt)}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectReport(report);
                        }}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <style>{`
        .directory-table-row:hover {
          background-color: #F8FAFC;
        }
      `}</style>
    </div>
  );
}
