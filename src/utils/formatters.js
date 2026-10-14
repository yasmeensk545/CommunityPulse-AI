/**
 * CommunityPulse AI - Formatting & Presentation Utilities
 */

/**
 * Human-readable relative time (e.g., "5 minutes ago", "3 hours ago", "2 days ago")
 */
export function formatRelativeTime(dateString) {
  if (!dateString) return 'Just now';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Recently';

  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 45) return 'Just now';
  if (diffMin < 60) return `${diffMin} min${diffMin === 1 ? '' : 's'} ago`;
  if (diffHour < 24) return `${diffHour} hr${diffHour === 1 ? '' : 's'} ago`;
  if (diffDay === 1) return 'Yesterday';
  if (diffDay < 30) return `${diffDay} days ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Formats full timestamp
 */
export function formatFullDate(dateString) {
  if (!dateString) return 'N/A';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Returns color tokens and accessibility styling for priority levels
 */
export function getPriorityMeta(priority) {
  switch (priority) {
    case 'Critical':
      return {
        label: 'Critical',
        bg: '#FEE2E2',
        text: '#991B1B',
        border: '#F87171',
        badgeClass: 'badge-priority-critical',
        dotColor: '#DC2626'
      };
    case 'High':
      return {
        label: 'High',
        bg: '#FFEDD5',
        text: '#9A3412',
        border: '#FB923C',
        badgeClass: 'badge-priority-high',
        dotColor: '#EA580C'
      };
    case 'Medium':
      return {
        label: 'Medium',
        bg: '#E0F2FE',
        text: '#0369A1',
        border: '#38BDF8',
        badgeClass: 'badge-priority-medium',
        dotColor: '#0284C7'
      };
    case 'Low':
    default:
      return {
        label: 'Low',
        bg: '#F1F5F9',
        text: '#475569',
        border: '#CBD5E1',
        badgeClass: 'badge-priority-low',
        dotColor: '#64748B'
      };
  }
}

/**
 * Returns styling tokens for issue statuses
 */
export function getStatusMeta(status) {
  switch (status) {
    case 'Resolved':
      return {
        label: 'Resolved',
        bg: '#DCFCE7',
        text: '#166534',
        border: '#86EFAC',
        badgeClass: 'badge-status-resolved',
        dotColor: '#16A34A'
      };
    case 'In Progress':
      return {
        label: 'In Progress',
        bg: '#DBEAFE',
        text: '#1E40AF',
        border: '#93C5FD',
        badgeClass: 'badge-status-inprogress',
        dotColor: '#2563EB'
      };
    case 'Pending':
    case 'Under Review':
    case 'Reported':
    default:
      return {
        label: status === 'Reported' || status === 'Under Review' ? 'Pending' : (status || 'Pending'),
        bg: '#FEF3C7',
        text: '#92400E',
        border: '#FCD34D',
        badgeClass: 'badge-status-pending',
        dotColor: '#D97706'
      };
  }
}

/**
 * Shortens string with ellipsis
 */
export function truncate(text, max = 100) {
  if (!text) return '';
  if (text.length <= max) return text;
  return text.slice(0, max).trim() + '...';
}
