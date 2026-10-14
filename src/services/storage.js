import { INITIAL_SAMPLE_REPORTS } from './sampleData.js';

const STORAGE_KEY = 'communitypulse_reports_v2';
const API_KEY_STORAGE = 'communitypulse_gemini_api_key';

// In-memory fallback if localStorage is unavailable (e.g. Node.js unit testing)
let memoryStore = {};

function hasLocalStorage() {
  try {
    return typeof localStorage !== 'undefined' && 
      typeof localStorage.getItem === 'function' &&
      typeof localStorage.setItem === 'function';
  } catch {
    return false;
  }
}

function getItem(key) {
  if (hasLocalStorage()) {
    return localStorage.getItem(key);
  }
  return memoryStore[key] || null;
}

function setItem(key, value) {
  if (hasLocalStorage()) {
    localStorage.setItem(key, value);
  } else {
    memoryStore[key] = String(value);
  }
}

function removeItem(key) {
  if (hasLocalStorage()) {
    localStorage.removeItem(key);
  } else {
    delete memoryStore[key];
  }
}

// Valid categories defined by system
export const VALID_CATEGORIES = [
  'Waste Management',
  'Road Damage',
  'Water Leakage',
  'Streetlight',
  'Pollution',
  'Public Safety',
  'Accessibility',
  'Other'
];

export const VALID_PRIORITIES = ['Critical', 'High', 'Medium', 'Low'];

export const VALID_STATUSES = ['Reported', 'Under Review', 'In Progress', 'Resolved'];

/**
 * Validates a report object against required schema.
 * Replaces missing or invalid attributes with safe fallback defaults.
 */
function sanitizeReport(raw) {
  if (!raw || typeof raw !== 'object') return null;

  const id = typeof raw.id === 'string' && raw.id.trim() ? raw.id.trim() : `CP-${Math.floor(100 + Math.random() * 900)}`;
  const title = typeof raw.title === 'string' && raw.title.trim() ? raw.title.trim() : 'Untitled Civic Issue';
  const description = typeof raw.description === 'string' ? raw.description.trim() : '';
  const locality = typeof raw.locality === 'string' && raw.locality.trim() ? raw.locality.trim() : 'Locality Not Specified';
  
  const category = VALID_CATEGORIES.includes(raw.category) ? raw.category : 'Other';
  const priority = VALID_PRIORITIES.includes(raw.priority) ? raw.priority : 'Medium';
  const priorityScore = typeof raw.priorityScore === 'number' && !isNaN(raw.priorityScore) 
    ? Math.max(0, Math.min(100, Math.round(raw.priorityScore))) 
    : 50;
  const status = VALID_STATUSES.includes(raw.status) ? raw.status : 'Reported';
  
  const createdAt = raw.createdAt && !isNaN(new Date(raw.createdAt).getTime())
    ? new Date(raw.createdAt).toISOString()
    : new Date().toISOString();
    
  const updatedAt = raw.updatedAt && !isNaN(new Date(raw.updatedAt).getTime())
    ? new Date(raw.updatedAt).toISOString()
    : createdAt;

  const reportedBy = typeof raw.reportedBy === 'string' && raw.reportedBy.trim()
    ? raw.reportedBy.trim()
    : 'Local Resident';

  const affectedEstimate = typeof raw.affectedEstimate === 'string' ? raw.affectedEstimate.trim() : '';
  const imageUrl = typeof raw.imageUrl === 'string' ? raw.imageUrl : '';
  const isSample = Boolean(raw.isSample);

  // Sanitize AI analysis block
  const aiAnalysis = raw.aiAnalysis && typeof raw.aiAnalysis === 'object' ? {
    source: raw.aiAnalysis.source || 'Local Analysis Fallback',
    predictedCategory: raw.aiAnalysis.predictedCategory || category,
    priority: raw.aiAnalysis.priority || priority,
    priorityScore: typeof raw.aiAnalysis.priorityScore === 'number' ? raw.aiAnalysis.priorityScore : priorityScore,
    department: raw.aiAnalysis.department || 'General Municipal Services',
    recommendedAction: raw.aiAnalysis.recommendedAction || 'Inspect and assess on-site.',
    explanation: raw.aiAnalysis.explanation || 'Issue logged for civic evaluation.',
    safetyConcerns: raw.aiAnalysis.safetyConcerns || 'No immediate structural safety hazard reported.',
    environmentalConcerns: raw.aiAnalysis.environmentalConcerns || 'No severe environmental danger observed.',
    urgencyFactors: Array.isArray(raw.aiAnalysis.urgencyFactors) ? raw.aiAnalysis.urgencyFactors : [],
    confidence: typeof raw.aiAnalysis.confidence === 'number' ? raw.aiAnalysis.confidence : 0.85
  } : null;

  // Sanitize resolution notes array
  const resolutionNotes = Array.isArray(raw.resolutionNotes)
    ? raw.resolutionNotes
        .filter(n => n && typeof n.text === 'string' && n.text.trim())
        .map((n, idx) => ({
          id: n.id || `rn-${idx + 1}-${Date.now()}`,
          author: n.author || 'Municipal Staff',
          text: n.text.trim(),
          timestamp: n.timestamp && !isNaN(new Date(n.timestamp).getTime())
            ? new Date(n.timestamp).toISOString()
            : new Date().toISOString()
        }))
    : [];

  return {
    id,
    title,
    description,
    locality,
    category,
    priority,
    priorityScore,
    status,
    reportedBy,
    affectedEstimate,
    imageUrl,
    isSample,
    createdAt,
    updatedAt,
    aiAnalysis,
    resolutionNotes
  };
}

/**
 * Storage repository service
 */
export const storageService = {
  /**
   * Retrieves all reports from storage with validation and seed fallback
   */
  getReports: () => {
    try {
      const rawData = getItem(STORAGE_KEY);
      if (!rawData) {
        // Initialize with realistic sample reports
        const initial = INITIAL_SAMPLE_REPORTS.map(sanitizeReport).filter(Boolean);
        setItem(STORAGE_KEY, JSON.stringify(initial));
        return initial;
      }

      const parsed = JSON.parse(rawData);
      if (!Array.isArray(parsed)) {
        console.warn('CommunityPulse: Corrupted storage format, reseeding default records.');
        const initial = INITIAL_SAMPLE_REPORTS.map(sanitizeReport).filter(Boolean);
        setItem(STORAGE_KEY, JSON.stringify(initial));
        return initial;
      }

      const validList = parsed.map(sanitizeReport).filter(Boolean);
      if (parsed.length > 0 && validList.length === 0) {
        const initial = INITIAL_SAMPLE_REPORTS.map(sanitizeReport).filter(Boolean);
        setItem(STORAGE_KEY, JSON.stringify(initial));
        return initial;
      }

      return validList;
    } catch (err) {
      console.error('CommunityPulse Storage Error: Failed to read storage', err);
      return INITIAL_SAMPLE_REPORTS.map(sanitizeReport).filter(Boolean);
    }
  },

  /**
   * Retrieves a single report by ID
   */
  getReportById: (id) => {
    const list = storageService.getReports();
    return list.find(r => r.id === id) || null;
  },

  /**
   * Saves a new report
   */
  saveReport: (newReport) => {
    try {
      const sanitized = sanitizeReport(newReport);
      if (!sanitized) throw new Error('Invalid report payload.');

      const list = storageService.getReports();
      const existingIdx = list.findIndex(r => r.id === sanitized.id);
      if (existingIdx >= 0) {
        sanitized.id = `CP-${Math.floor(100 + Math.random() * 900)}`;
      }

      const updated = [sanitized, ...list];
      setItem(STORAGE_KEY, JSON.stringify(updated));
      return sanitized;
    } catch (err) {
      console.error('Failed to save report:', err);
      throw err;
    }
  },

  /**
   * Updates an existing report by ID
   */
  updateReport: (id, updates) => {
    try {
      const list = storageService.getReports();
      const index = list.findIndex(r => r.id === id);
      if (index === -1) {
        throw new Error(`Report #${id} not found.`);
      }

      const merged = {
        ...list[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };

      const sanitized = sanitizeReport(merged);
      list[index] = sanitized;
      setItem(STORAGE_KEY, JSON.stringify(list));
      return sanitized;
    } catch (err) {
      console.error('Failed to update report:', err);
      throw err;
    }
  },

  /**
   * Adds a resolution or inspection note to a report
   */
  addResolutionNote: (id, text, author = 'Municipal Staff') => {
    const report = storageService.getReportById(id);
    if (!report) throw new Error('Report not found');

    const newNote = {
      id: `rn-${Date.now()}`,
      author: author.trim() || 'Civic Officer',
      text: text.trim(),
      timestamp: new Date().toISOString()
    };

    const updatedNotes = [newNote, ...(report.resolutionNotes || [])];
    return storageService.updateReport(id, { resolutionNotes: updatedNotes });
  },

  /**
   * Deletes a report
   */
  deleteReport: (id) => {
    const list = storageService.getReports();
    const filtered = list.filter(r => r.id !== id);
    setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  },

  /**
   * Resets data to initial sample dataset
   */
  resetToSampleData: () => {
    const initial = INITIAL_SAMPLE_REPORTS.map(sanitizeReport).filter(Boolean);
    setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  },

  /**
   * Clears all reports
   */
  clearAllReports: () => {
    setItem(STORAGE_KEY, JSON.stringify([]));
    return [];
  },

  /**
   * Exports dataset as formatted JSON string
   */
  exportDataJSON: () => {
    const list = storageService.getReports();
    return JSON.stringify(list, null, 2);
  },

  /**
   * Imports dataset from JSON string with validation
   */
  importDataJSON: (jsonString) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!Array.isArray(parsed)) throw new Error('Import data must be a JSON array of reports.');
      const valid = parsed.map(sanitizeReport).filter(Boolean);
      if (valid.length === 0) throw new Error('No valid civic reports detected in the import file.');
      setItem(STORAGE_KEY, JSON.stringify(valid));
      return valid;
    } catch (err) {
      console.error('Data import failed:', err);
      throw err;
    }
  },

  /**
   * API Key management
   */
  getApiKey: () => {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GEMINI_API_KEY) {
      return import.meta.env.VITE_GEMINI_API_KEY;
    }
    return getItem(API_KEY_STORAGE) || '';
  },

  setApiKey: (key) => {
    if (!key || !key.trim()) {
      removeItem(API_KEY_STORAGE);
    } else {
      setItem(API_KEY_STORAGE, key.trim());
    }
  },

  clearApiKey: () => {
    removeItem(API_KEY_STORAGE);
  },

  /**
   * Diagnostics info for storage status
   */
  getDiagnostics: () => {
    try {
      const raw = getItem(STORAGE_KEY) || '[]';
      const sizeBytes = typeof Blob !== 'undefined' ? new Blob([raw]).size : Buffer.byteLength(raw);
      const count = storageService.getReports().length;
      const hasApiKey = Boolean(storageService.getApiKey());
      return {
        itemCount: count,
        storageSizeBytes: sizeBytes,
        storageSizeFormatted: `${(sizeBytes / 1024).toFixed(1)} KB`,
        storageType: hasLocalStorage() ? 'HTML5 localStorage (Demo Tier)' : 'In-Memory Store (Testing / Node)',
        hasCustomApiKey: hasApiKey
      };
    } catch {
      return {
        itemCount: 0,
        storageSizeBytes: 0,
        storageSizeFormatted: '0 KB',
        storageType: 'Storage Fallback',
        hasCustomApiKey: false
      };
    }
  }
};
