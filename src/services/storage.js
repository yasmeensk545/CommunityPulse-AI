import { INITIAL_SAMPLE_REPORTS } from './sampleData.js';

const STORAGE_KEY = 'community_reports';
const LEGACY_STORAGE_KEYS = ['communitypulse_reports_v2', 'communitypulse_reports'];
const API_KEY_STORAGE = 'communitypulse_gemini_api_key';
const RATE_LIMIT_KEY = 'communitypulse_last_submission_time';
const RATE_LIMIT_SECONDS = 120; // 2 minutes
const STAFF_SESSION_KEY = 'community_staff_session';

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

// Strictly Pending, In Progress, Resolved as specified in Master Prompt
export const VALID_STATUSES = ['Pending', 'In Progress', 'Resolved'];

/**
 * Generates unique report ID with format CP-2026-XXXXX (5 random digits)
 * and collision checking against existing list.
 */
export function generateReportId(existingReports = []) {
  const existingIds = new Set((existingReports || []).map(r => r && r.id).filter(Boolean));
  for (let attempt = 0; attempt < 500; attempt++) {
    const randomFiveDigit = Math.floor(10000 + Math.random() * 90000);
    const candidateId = `CP-2026-${randomFiveDigit}`;
    if (!existingIds.has(candidateId)) {
      return candidateId;
    }
  }
  return `CP-2026-${Date.now().toString().slice(-5)}`;
}

/**
 * Validates and sanitizes a report object.
 * Maps legacy 'Reported' and 'Under Review' to 'Pending'.
 * Separates citizen-visible publicNote from staff-only internalNotes.
 */
export function sanitizeReport(raw) {
  if (!raw || typeof raw !== 'object') return null;

  let id = typeof raw.id === 'string' && raw.id.trim() ? raw.id.trim() : '';
  if (!id) {
    id = `CP-2026-${Math.floor(10000 + Math.random() * 90000)}`;
  }

  const title = typeof raw.title === 'string' && raw.title.trim() ? raw.title.trim() : 'Untitled Civic Issue';
  const description = typeof raw.description === 'string' ? raw.description.trim() : '';
  const locality = typeof raw.locality === 'string' && raw.locality.trim() ? raw.locality.trim() : 'Locality Not Specified';
  const ward = typeof raw.ward === 'string' && raw.ward.trim() ? raw.ward.trim() : '';
  
  const category = VALID_CATEGORIES.includes(raw.category) ? raw.category : 'Other';
  const priority = VALID_PRIORITIES.includes(raw.priority) ? raw.priority : 'Medium';
  const priorityScore = typeof raw.priorityScore === 'number' && !isNaN(raw.priorityScore) 
    ? Math.max(0, Math.min(100, Math.round(raw.priorityScore))) 
    : 50;

  // Status mapping: 'Reported' and 'Under Review' map to 'Pending'
  let status = 'Pending';
  if (raw.status === 'In Progress') {
    status = 'In Progress';
  } else if (raw.status === 'Resolved') {
    status = 'Resolved';
  } else {
    status = 'Pending';
  }
  
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
  const legacyId = typeof raw.legacyId === 'string' ? raw.legacyId : undefined;

  // Public note: citizen-visible string
  const publicNote = typeof raw.publicNote === 'string' ? raw.publicNote.trim() : '';

  // Internal notes: staff-only notes
  let internalNotes = [];
  if (Array.isArray(raw.internalNotes)) {
    internalNotes = raw.internalNotes
      .filter(n => n && typeof n.text === 'string' && n.text.trim())
      .map((n, idx) => ({
        id: n.id || `in-${idx + 1}-${Date.now()}`,
        author: n.author || 'Municipal Staff',
        text: n.text.trim(),
        timestamp: n.timestamp && !isNaN(new Date(n.timestamp).getTime())
          ? new Date(n.timestamp).toISOString()
          : new Date().toISOString()
      }));
  } else if (Array.isArray(raw.resolutionNotes)) {
    // Migrate legacy resolutionNotes to internalNotes
    internalNotes = raw.resolutionNotes
      .filter(n => n && typeof n.text === 'string' && n.text.trim())
      .map((n, idx) => ({
        id: n.id || `in-${idx + 1}-${Date.now()}`,
        author: n.author || 'Municipal Staff',
        text: n.text.trim(),
        timestamp: n.timestamp && !isNaN(new Date(n.timestamp).getTime())
          ? new Date(n.timestamp).toISOString()
          : new Date().toISOString()
      }));
  }

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

  return {
    id,
    ...(legacyId ? { legacyId } : {}),
    title,
    description,
    locality,
    ward,
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
    publicNote,
    internalNotes,
    // Provide resolutionNotes alias pointing to internalNotes for legacy compatibility
    get resolutionNotes() {
      return this.internalNotes;
    },
    aiAnalysis
  };
}

/**
 * Storage repository service
 */
export const storageService = {
  /**
   * Retrieves all reports from storage with migration and sample seed fallback
   */
  getReports: () => {
    try {
      let rawData = getItem(STORAGE_KEY);
      
      // Check legacy keys for migration if primary key is empty
      if (!rawData) {
        for (const legacyKey of LEGACY_STORAGE_KEYS) {
          const legacyData = getItem(legacyKey);
          if (legacyData) {
            try {
              const parsedLegacy = JSON.parse(legacyData);
              if (Array.isArray(parsedLegacy) && parsedLegacy.length > 0) {
                const migrated = parsedLegacy.map(sanitizeReport).filter(Boolean);
                setItem(STORAGE_KEY, JSON.stringify(migrated));
                return migrated;
              }
            } catch {
              // Ignore corrupt legacy data
            }
          }
        }

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
   * Retrieves a single report by ID (supports exact match and legacyId match)
   */
  getReportById: (id) => {
    if (!id || typeof id !== 'string') return null;
    const cleanId = id.trim().toUpperCase();
    const list = storageService.getReports();
    return list.find(r => r.id.toUpperCase() === cleanId || (r.legacyId && r.legacyId.toUpperCase() === cleanId)) || null;
  },

  /**
   * Saves a new report
   */
  saveReport: (newReport) => {
    try {
      const list = storageService.getReports();
      
      // Auto-generate CP-2026-XXXXX ID if missing or colliding
      let targetId = newReport.id;
      if (!targetId || list.some(r => r.id === targetId)) {
        targetId = generateReportId(list);
      }

      const sanitized = sanitizeReport({
        ...newReport,
        id: targetId
      });
      if (!sanitized) throw new Error('Invalid report payload.');

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
      const index = list.findIndex(r => r.id === id || (r.legacyId && r.legacyId === id));
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
   * Comprehensive department status update helper
   * Separates citizen public note from staff internal note
   */
  updateReportStatus: (id, newStatus, publicNote, internalNote, author = 'Staff Officer', department = null) => {
    const report = storageService.getReportById(id);
    if (!report) throw new Error(`Report #${id} not found.`);

    const updates = {
      status: VALID_STATUSES.includes(newStatus) ? newStatus : report.status,
      updatedAt: new Date().toISOString()
    };

    if (typeof publicNote === 'string' && publicNote.trim()) {
      updates.publicNote = publicNote.trim();
    }

    if (typeof internalNote === 'string' && internalNote.trim()) {
      const noteObj = {
        id: `in-${Date.now()}`,
        author: author.trim() || 'Staff Officer',
        text: internalNote.trim(),
        timestamp: new Date().toISOString()
      };
      updates.internalNotes = [noteObj, ...(report.internalNotes || [])];
    }

    if (department && report.aiAnalysis) {
      updates.aiAnalysis = {
        ...report.aiAnalysis,
        department: department.trim()
      };
    }

    return storageService.updateReport(report.id, updates);
  },

  /**
   * Adds an internal staff note
   */
  addInternalNote: (id, text, author = 'Staff Officer') => {
    const report = storageService.getReportById(id);
    if (!report) throw new Error('Report not found');

    const newNote = {
      id: `in-${Date.now()}`,
      author: author.trim() || 'Staff Officer',
      text: text.trim(),
      timestamp: new Date().toISOString()
    };

    const updatedNotes = [newNote, ...(report.internalNotes || [])];
    return storageService.updateReport(report.id, { internalNotes: updatedNotes });
  },

  /**
   * Updates citizen-facing public note
   */
  updateReportPublicNote: (id, publicNote) => {
    return storageService.updateReport(id, { publicNote: (publicNote || '').trim() });
  },

  /**
   * Legacy resolution note adapter
   */
  addResolutionNote: (id, text, author = 'Municipal Staff') => {
    return storageService.addInternalNote(id, text, author);
  },

  /**
   * Deletes a report
   */
  deleteReport: (id) => {
    const list = storageService.getReports();
    const filtered = list.filter(r => r.id !== id && r.legacyId !== id);
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
   * Rate Limiting per device: 2 minutes cooldown
   */
  getRateLimitRemainingSeconds: () => {
    try {
      const stored = getItem(RATE_LIMIT_KEY);
      if (!stored) return 0;
      const lastTime = parseInt(stored, 10);
      if (isNaN(lastTime)) return 0;
      const elapsedSeconds = Math.floor((Date.now() - lastTime) / 1000);
      if (elapsedSeconds < RATE_LIMIT_SECONDS) {
        return RATE_LIMIT_SECONDS - elapsedSeconds;
      }
      return 0;
    } catch {
      return 0;
    }
  },

  recordSubmissionTime: () => {
    try {
      setItem(RATE_LIMIT_KEY, Date.now().toString());
    } catch (e) {
      console.warn('Failed to record submission time for rate limit:', e);
    }
  },

  clearRateLimit: () => {
    removeItem(RATE_LIMIT_KEY);
  },

  /**
   * Department Staff Authentication & Session
   */
  getStaffSession: () => {
    try {
      const data = getItem(STAFF_SESSION_KEY);
      if (!data) return null;
      const session = JSON.parse(data);
      if (session && session.staffId) {
        return session;
      }
      return null;
    } catch {
      return null;
    }
  },

  isStaffAuthenticated: () => {
    return Boolean(storageService.getStaffSession());
  },

  loginStaff: (staffId, password) => {
    const cleanId = (staffId || '').trim();
    const cleanPass = (password || '').trim();

    if (!cleanId || !cleanPass) {
      return { success: false, error: 'Staff ID and Password are required.' };
    }

    // Demo credentials check:
    // Requires valid Staff ID format and allowed demo password
    const ALLOWED_DEMO_PASSWORDS = ['admin123', 'staff123', 'demo123', 'guntur2026', 'civic2026'];
    const isIdValid = cleanId.length >= 3;
    const isPassValid = ALLOWED_DEMO_PASSWORDS.includes(cleanPass.toLowerCase());

    if (isIdValid && isPassValid) {
      const session = {
        staffId: cleanId.toUpperCase(),
        name: cleanId.toUpperCase().includes('ADMIN') ? 'Municipal Administrator' : 'Department Duty Officer',
        role: cleanId.toUpperCase().includes('ADMIN') ? 'Administrator' : 'Operations Staff',
        loggedInAt: new Date().toISOString()
      };
      setItem(STAFF_SESSION_KEY, JSON.stringify(session));
      return { success: true, session };
    }

    return { 
      success: false, 
      error: 'Invalid Staff ID or Password. Demo credentials: ID: STAFF-01 | Password: admin123' 
    };
  },

  logoutStaff: () => {
    removeItem(STAFF_SESSION_KEY);
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
        storageKey: STORAGE_KEY,
        storageSizeBytes: sizeBytes,
        storageSizeFormatted: `${(sizeBytes / 1024).toFixed(1)} KB`,
        storageType: hasLocalStorage() ? 'HTML5 localStorage (Demo Tier)' : 'In-Memory Store (Testing / Node)',
        hasCustomApiKey: hasApiKey,
        isStaffLoggedIn: storageService.isStaffAuthenticated(),
        rateLimitRemaining: storageService.getRateLimitRemainingSeconds()
      };
    } catch {
      return {
        itemCount: 0,
        storageKey: STORAGE_KEY,
        storageSizeBytes: 0,
        storageSizeFormatted: '0 KB',
        storageType: 'Storage Fallback',
        hasCustomApiKey: false,
        isStaffLoggedIn: false,
        rateLimitRemaining: 0
      };
    }
  }
};
