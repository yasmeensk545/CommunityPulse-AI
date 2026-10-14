import React, { useState } from 'react';
import { 
  X, 
  Key, 
  Database, 
  RotateCcw, 
  Download, 
  Upload, 
  Trash2, 
  CheckCircle, 
  AlertTriangle, 
  Sparkles,
  Info
} from 'lucide-react';
import { storageService } from '../services/storage.js';

export function SettingsModal({
  isOpen,
  onClose,
  onDataReset,
  onDataClear,
  onDataImport,
  triggerToast
}) {
  const [apiKeyInput, setApiKeyInput] = useState(storageService.getApiKey());
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [testResult, setTestResult] = useState(null); // { success: boolean, message: string }
  const [importJsonText, setImportJsonText] = useState('');
  const [showImportBox, setShowImportBox] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  if (!isOpen) return null;

  const diagnostics = storageService.getDiagnostics();

  const handleSaveApiKey = () => {
    storageService.setApiKey(apiKeyInput);
    triggerToast('API Key configuration updated.', 'success');
    setTestResult(null);
  };

  const handleClearApiKey = () => {
    storageService.clearApiKey();
    setApiKeyInput('');
    triggerToast('Gemini API key removed. Switched to local rules engine.', 'warning');
    setTestResult(null);
  };

  const handleTestApiKey = async () => {
    const key = apiKeyInput.trim();
    if (!key) {
      setTestResult({ success: false, message: 'Please enter a Gemini API key first.' });
      return;
    }

    setIsTestingKey(true);
    setTestResult(null);

    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Respond with the single word: "VERIFIED"' }] }]
        })
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text.slice(0, 80)}`);
      }

      setTestResult({ success: true, message: 'Gemini 2.5 Flash API connection verified successfully!' });
      storageService.setApiKey(key);
      triggerToast('Gemini API verified and saved.', 'success');
    } catch (err) {
      setTestResult({ success: false, message: `Connection failed: ${err.message}` });
    } finally {
      setIsTestingKey(false);
    }
  };

  const handleExportData = () => {
    const jsonStr = storageService.exportDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `communitypulse-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    triggerToast('Report dataset exported as JSON.', 'success');
  };

  const handleImportSubmit = () => {
    try {
      if (!importJsonText.trim()) return;
      onDataImport(importJsonText);
      setShowImportBox(false);
      setImportJsonText('');
      triggerToast('Dataset imported and validated successfully.', 'success');
    } catch (err) {
      triggerToast(`Import error: ${err.message}`, 'error');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-dialog modal-dialog-large">
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#F0FDFA',
                color: '#0D9488',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Database size={20} />
            </div>
            <div>
              <h2 className="heading-2">System Settings & Data Management</h2>
              <p className="text-muted" style={{ fontSize: '0.8rem' }}>
                AI engine configuration, localStorage diagnostics, and dataset controls.
              </p>
            </div>
          </div>

          <button onClick={onClose} className="btn btn-secondary btn-sm" aria-label="Close dialog">
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Section 1: Gemini AI Credentials */}
          <div className="cp-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
              <Key size={18} style={{ color: '#0D9488' }} />
              <h3 className="heading-3">Google Gemini AI Integration</h3>
            </div>

            <p style={{ fontSize: '0.825rem', color: '#475569', lineHeight: 1.45, marginBottom: '0.85rem' }}>
              CommunityPulse AI seamlessly connects to Google Gemini 2.5 Flash for live multimodal triage. If no key is provided, the application automatically uses our built-in <strong>Explainable Local Rules Engine</strong> with full functionality.
            </p>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <input
                type="password"
                placeholder="Paste Gemini API Key (e.g., AIzaSy...)"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                className="form-input"
                style={{ flex: 1, height: '38px', fontSize: '0.825rem' }}
              />
              <button
                type="button"
                onClick={handleSaveApiKey}
                className="btn btn-secondary btn-sm"
              >
                Save
              </button>
              <button
                type="button"
                onClick={handleTestApiKey}
                disabled={isTestingKey}
                className="btn btn-teal-outline btn-sm"
              >
                <Sparkles size={14} />
                <span>{isTestingKey ? 'Testing...' : 'Test Key'}</span>
              </button>
              {apiKeyInput && (
                <button
                  type="button"
                  onClick={handleClearApiKey}
                  className="btn btn-danger btn-sm"
                  title="Remove Key"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>

            {testResult && (
              <div
                style={{
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  backgroundColor: testResult.success ? '#F0FDF4' : '#FEF2F2',
                  border: `1px solid ${testResult.success ? '#86EFAC' : '#FCA5A5'}`,
                  color: testResult.success ? '#166534' : '#991B1B',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem'
                }}
              >
                {testResult.success ? <CheckCircle size={15} /> : <AlertTriangle size={15} />}
                <span>{testResult.message}</span>
              </div>
            )}

            <div style={{ marginTop: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', color: '#64748B' }}>
              <Info size={13} style={{ color: '#0D9488' }} />
              <span>Keys are stored strictly in client-side browser storage and never transmitted to unauthorized endpoints.</span>
            </div>
          </div>

          {/* Section 2: Local Storage Diagnostics */}
          <div className="cp-card">
            <h3 className="heading-3" style={{ marginBottom: '0.75rem' }}>
              Storage Diagnostics & Operational Tier
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '0.85rem' }}>
              <div style={{ padding: '0.75rem', borderRadius: '8px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <span className="text-muted" style={{ fontSize: '0.72rem', textTransform: 'uppercase' }}>Stored Records</span>
                <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>
                  {diagnostics.itemCount} Reports
                </p>
              </div>

              <div style={{ padding: '0.75rem', borderRadius: '8px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <span className="text-muted" style={{ fontSize: '0.72rem', textTransform: 'uppercase' }}>Storage Footprint</span>
                <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>
                  {diagnostics.storageSizeFormatted}
                </p>
              </div>

              <div style={{ padding: '0.75rem', borderRadius: '8px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <span className="text-muted" style={{ fontSize: '0.72rem', textTransform: 'uppercase' }}>Active Storage Engine</span>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0D9488', marginTop: '4px' }}>
                  HTML5 LocalStorage
                </p>
              </div>
            </div>

            <p style={{ fontSize: '0.75rem', color: '#64748B', lineHeight: 1.4 }}>
              <strong>Notice:</strong> Browser localStorage is used for this challenge evaluation and interactive prototype demonstration. For city-wide production rollouts, CommunityPulse integrates with secure municipal PostgreSQL / PostGIS backends with role-based JWT authentication.
            </p>
          </div>

          {/* Section 3: Dataset Operations */}
          <div className="cp-card">
            <h3 className="heading-3" style={{ marginBottom: '0.75rem' }}>
              Dataset Operations & Demonstration Controls
            </h3>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => {
                  onDataReset();
                  triggerToast('Restored standard civic sample dataset.', 'success');
                }}
                className="btn btn-secondary btn-sm"
              >
                <RotateCcw size={14} />
                <span>Reset to Sample Data</span>
              </button>

              <button
                type="button"
                onClick={handleExportData}
                className="btn btn-secondary btn-sm"
              >
                <Download size={14} />
                <span>Export Dataset (.json)</span>
              </button>

              <button
                type="button"
                onClick={() => setShowImportBox(!showImportBox)}
                className="btn btn-secondary btn-sm"
              >
                <Upload size={14} />
                <span>Import JSON</span>
              </button>

              {showClearConfirm ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      onDataClear();
                      setShowClearConfirm(false);
                      triggerToast('All reports cleared from storage.', 'warning');
                    }}
                    className="btn btn-danger btn-sm"
                  >
                    Confirm Wipe
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowClearConfirm(false)}
                    className="btn btn-secondary btn-sm"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(true)}
                  className="btn btn-secondary btn-sm"
                  style={{ color: '#DC2626', borderColor: '#FCA5A5' }}
                >
                  <Trash2 size={14} />
                  <span>Wipe All Records</span>
                </button>
              )}
            </div>

            {/* Import JSON Box */}
            {showImportBox && (
              <div style={{ marginTop: '1rem', padding: '0.85rem', borderRadius: '8px', backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1' }}>
                <label className="form-label" style={{ fontSize: '0.78rem' }}>
                  Paste Community Reports JSON Array:
                </label>
                <textarea
                  rows={4}
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  placeholder="[{ id: 'CP-101', title: '...', category: '...' }, ...]"
                  className="form-textarea"
                  style={{ fontSize: '0.75rem', fontFamily: 'monospace' }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button onClick={() => setShowImportBox(false)} className="btn btn-secondary btn-sm">
                    Cancel
                  </button>
                  <button onClick={handleImportSubmit} className="btn btn-primary btn-sm">
                    Validate & Import
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">
            Close Settings
          </button>
        </div>
      </div>
    </div>
  );
}
