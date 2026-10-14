import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  ArrowRight, 
  Building, 
  Trash2, 
  Droplets, 
  Lightbulb, 
  ShieldAlert, 
  Accessibility, 
  HelpCircle, 
  AlertTriangle, 
  Camera, 
  Check, 
  Copy, 
  CheckCircle2, 
  Search, 
  Clock 
} from 'lucide-react';
import { analyzeCivicIssue } from '../services/aiService.js';
import { checkDuplicate } from '../services/duplicateDetector.js';
import { PriorityBadge, AiSourceBadge } from './common/Badge.jsx';
import { DuplicateModal } from './DuplicateModal.jsx';
import { storageService, generateReportId } from '../services/storage.js';

// Friendly category cards for citizens
const CATEGORY_OPTIONS = [
  { id: 'Waste Management', label: 'Garbage & Waste', icon: Trash2, desc: 'Overflowing bins, trash on streets' },
  { id: 'Road Damage', label: 'Road Damage', icon: AlertTriangle, desc: 'Potholes, broken asphalt, cracks' },
  { id: 'Water Leakage', label: 'Water Leakage', icon: Droplets, desc: 'Burst pipes, pooling water, hydrants' },
  { id: 'Streetlight', label: 'Streetlights', icon: Lightbulb, desc: 'Dark streetlights, flickering lamps' },
  { id: 'Pollution', label: 'Pollution', icon: ShieldAlert, desc: 'Chemical spills, odors, dirty creek' },
  { id: 'Public Safety', label: 'Public Safety', icon: ShieldAlert, desc: 'Traffic light out, dangerous crossing' },
  { id: 'Accessibility', label: 'Accessibility', icon: Accessibility, desc: 'Broken wheelchair ramp, blocked path' },
  { id: 'Other', label: 'Other Problem', icon: HelpCircle, desc: 'Any other neighbourhood issue' }
];

export function ReportFormModal({
  isOpen,
  onClose,
  onSubmitSuccess,
  onNavigateToTrack,
  existingReports = [],
  initialCategory = 'Road Damage'
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locality, setLocality] = useState('');
  const [category, setCategory] = useState(initialCategory || 'Road Damage');
  const [affectedEstimate, setAffectedEstimate] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');

  // Validation
  const [errors, setErrors] = useState({});

  // AI Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiError, setAiError] = useState(null);

  // Duplicate Check state
  const [duplicateMatch, setDuplicateMatch] = useState(null);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);

  // Rate Limiting (2 minutes)
  const [rateLimitSeconds, setRateLimitSeconds] = useState(0);

  // Success Screen state
  const [submittedReport, setSubmittedReport] = useState(null);
  const [isCopied, setIsCopied] = useState(false);

  // Update category if initialCategory changes
  const [prevCategoryProp, setPrevCategoryProp] = useState(initialCategory);
  if (initialCategory !== prevCategoryProp) {
    setPrevCategoryProp(initialCategory);
    setCategory(initialCategory || 'Road Damage');
  }

  // Rate Limit Countdown Interval
  useEffect(() => {
    if (!isOpen) return;

    const checkLimit = () => {
      const remaining = storageService.getRateLimitRemainingSeconds();
      setRateLimitSeconds(remaining);
    };

    checkLimit();
    const interval = setInterval(checkLimit, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle local image file preview
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: 'Please choose an image under 3 MB.' }));
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setImageUrl(reader.result);
      };
      reader.readAsDataURL(file);
      setErrors(prev => ({ ...prev, image: null }));
    }
  };

  const removeImage = () => {
    setImagePreview('');
    setImageUrl('');
  };

  // Run AI analysis
  const handleRunAiAnalysis = async () => {
    const fieldErrors = {};
    if (!title.trim()) fieldErrors.title = 'Please enter what the problem is first.';
    if (!description.trim() || description.trim().length < 10) {
      fieldErrors.description = 'Please write a brief description (at least 10 characters).';
    }
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsAnalyzing(true);
    setAiError(null);

    try {
      const result = await analyzeCivicIssue({
        title,
        description,
        locality: locality || 'Neighbourhood location',
        category,
        affectedEstimate
      });
      setAiResult(result);
    } catch (err) {
      console.error('AI Analysis failed:', err);
      setAiError('Could not connect to AI service. You can still submit your report directly.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applyAiCategory = () => {
    if (aiResult?.predictedCategory) {
      setCategory(aiResult.predictedCategory);
    }
  };

  // Validate form before submission
  const validateForm = () => {
    const newErrors = {};
    if (!title.trim()) {
      newErrors.title = 'Please give your report a title.';
    } else if (title.trim().length < 5) {
      newErrors.title = 'Please write at least 5 characters (e.g. Deep pothole on 4th Ave).';
    }

    if (!description.trim()) {
      newErrors.description = 'Please tell us what happened.';
    } else if (description.trim().length < 10) {
      newErrors.description = 'Please provide a little more detail so crews know what to bring.';
    }

    if (!locality.trim()) {
      newErrors.locality = 'Please tell us where this problem is located.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetForm = () => {
    setTitle('');
    setDescription('');
    setLocality('');
    setCategory('Road Damage');
    setAffectedEstimate('');
    setImageUrl('');
    setImagePreview('');
    setAiResult(null);
    setErrors({});
    setShowDuplicateModal(false);
    setSubmittedReport(null);
    setIsCopied(false);
  };

  const handleCloseModal = () => {
    handleResetForm();
    onClose();
  };

  // Copy Report ID to Clipboard
  const handleCopyId = (id) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(id);
    }
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  };

  // Submit Handler
  const handleSubmit = async (overrideDuplicate = false) => {
    // Check client rate limit
    const remaining = storageService.getRateLimitRemainingSeconds();
    if (remaining > 0) {
      setErrors({ rateLimit: `Please wait ${remaining} seconds before submitting another report from this browser.` });
      return;
    }

    if (!validateForm()) return;

    // Use AI result if already generated, or generate quickly
    const finalAi = aiResult || await (async () => {
      return await analyzeCivicIssue({
        title,
        description,
        locality,
        category,
        affectedEstimate
      });
    })();

    const nowIso = new Date().toISOString();
    const newReportId = generateReportId(existingReports);

    const candidatePayload = {
      id: newReportId,
      title: title.trim(),
      description: description.trim(),
      locality: locality.trim(),
      category: category,
      priority: finalAi.priority,
      priorityScore: finalAi.priorityScore,
      status: 'Pending',
      reportedBy: 'Local Resident',
      affectedEstimate: affectedEstimate.trim() || 'Local neighbours',
      imageUrl: imageUrl || '',
      isSample: false,
      createdAt: nowIso,
      updatedAt: nowIso,
      publicNote: '',
      internalNotes: [],
      aiAnalysis: finalAi
    };

    // Duplicate check within last 24 hours
    if (!overrideDuplicate) {
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
      const recentReports = existingReports.filter(r => new Date(r.createdAt).getTime() >= oneDayAgo);
      const dupCheck = checkDuplicate(candidatePayload, recentReports.length > 0 ? recentReports : existingReports, 45);
      
      if (dupCheck.isDuplicate) {
        setDuplicateMatch(dupCheck);
        setShowDuplicateModal(true);
        return;
      }
    }

    // Record submission time for 2-minute rate limit
    storageService.recordSubmissionTime();

    // Save report in storage & notify parent
    onSubmitSuccess(candidatePayload);

    // Show friendly success screen inside modal!
    setSubmittedReport(candidatePayload);
  };

  return (
    <>
      <div className="modal-overlay">
        <div className="modal-dialog modal-dialog-large" style={{ maxHeight: '92vh' }}>
          {/* Header */}
          <div className="modal-header">
            <div>
              <h2 className="heading-2" style={{ fontSize: '1.25rem', color: '#0F172A' }}>
                {submittedReport ? 'Report Submitted' : 'Report a Community Problem'}
              </h2>
              <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '2px' }}>
                {submittedReport 
                  ? 'Your civic ticket is logged and ready to track.' 
                  : 'Takes only 1 minute. Our smart assistant alerts the right city department.'}
              </p>
            </div>
            <button onClick={handleCloseModal} className="btn btn-secondary btn-sm" aria-label="Close dialog">
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="modal-body" style={{ overflowY: 'auto' }}>
            {/* SUCCESS SCREEN */}
            {submittedReport ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: '#DCFCE7',
                    color: '#16A34A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.25rem',
                    boxShadow: '0 4px 12px rgba(22, 163, 74, 0.2)'
                  }}
                >
                  <CheckCircle2 size={36} />
                </div>

                <h3 className="heading-1" style={{ fontSize: '1.5rem', color: '#0F172A', marginBottom: '0.5rem' }}>
                  Report Submitted Successfully!
                </h3>
                <p className="text-muted" style={{ fontSize: '0.9rem', maxWidth: '480px', margin: '0 auto 1.75rem' }}>
                  Thank you for helping improve our neighbourhood. Your issue has been logged and assigned to <strong>{submittedReport.aiAnalysis?.department || 'Municipal Services'}</strong>.
                </p>

                {/* Report ID Highlight Box */}
                <div
                  style={{
                    backgroundColor: '#EFF6FF',
                    border: '2px dashed #93C5FD',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    maxWidth: '420px',
                    margin: '0 auto 1.75rem'
                  }}
                >
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1E40AF', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Your Tracking Report ID
                  </span>
                  <div
                    style={{
                      fontSize: '2rem',
                      fontWeight: 800,
                      fontFamily: 'monospace',
                      color: '#2563EB',
                      margin: '0.5rem 0',
                      letterSpacing: '0.05em'
                    }}
                  >
                    {submittedReport.id}
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#475569', marginBottom: '1rem' }}>
                    Keep this ID to check status anytime on the tracking page.
                  </p>

                  <button
                    onClick={() => handleCopyId(submittedReport.id)}
                    className="btn btn-secondary btn-sm"
                    style={{
                      padding: '0.5rem 1rem',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      backgroundColor: '#FFFFFF',
                      borderColor: '#93C5FD',
                      color: '#1E40AF'
                    }}
                    id="copy-report-id-btn"
                  >
                    {isCopied ? <Check size={16} style={{ color: '#16A34A' }} /> : <Copy size={16} />}
                    <span>{isCopied ? 'Copied to Clipboard!' : 'Copy Report ID'}</span>
                  </button>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => {
                      if (onNavigateToTrack) {
                        onNavigateToTrack(submittedReport.id);
                      }
                      handleCloseModal();
                    }}
                    className="btn btn-blue btn-lg"
                    style={{ padding: '0.8rem 1.6rem', fontSize: '0.95rem' }}
                    id="track-submitted-report-btn"
                  >
                    <Search size={18} />
                    <span>Track My Report Now</span>
                  </button>

                  <button
                    onClick={handleResetForm}
                    className="btn btn-secondary btn-lg"
                    style={{ padding: '0.8rem 1.4rem', fontSize: '0.95rem' }}
                  >
                    <span>Submit Another Report</span>
                  </button>
                </div>
              </div>
            ) : (
              /* REPORT FORM */
              <>
                {/* 2-Minute Rate Limit Warning Banner (if active) */}
                {rateLimitSeconds > 0 && (
                  <div
                    style={{
                      backgroundColor: '#FFFBEB',
                      border: '1px solid #FDE68A',
                      color: '#92400E',
                      borderRadius: '10px',
                      padding: '0.75rem 1rem',
                      marginBottom: '1.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      fontSize: '0.82rem'
                    }}
                  >
                    <Clock size={18} style={{ color: '#D97706', flexShrink: 0 }} />
                    <div>
                      <strong>Rate limit active:</strong> Please wait <strong>{rateLimitSeconds} seconds</strong> before submitting another report from this browser.
                    </div>
                  </div>
                )}

                {/* 1. Category Selection Cards */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label" style={{ marginBottom: '0.5rem' }}>
                    1. Select Issue Category: <span className="required">*</span>
                  </label>

                  <div className="category-card-grid">
                    {CATEGORY_OPTIONS.map(opt => {
                      const Icon = opt.icon;
                      const isSelected = category === opt.id;
                      return (
                        <div
                          key={opt.id}
                          onClick={() => setCategory(opt.id)}
                          className={`category-select-card ${isSelected ? 'active' : ''}`}
                        >
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              backgroundColor: isSelected ? '#EFF6FF' : '#F1F5F9',
                              color: isSelected ? '#2563EB' : '#475569',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <Icon size={18} />
                          </div>
                          <span style={{ fontSize: '0.78rem', fontWeight: isSelected ? 700 : 600, color: isSelected ? '#1E40AF' : '#334155' }}>
                            {opt.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Issue Title */}
                <div className="form-group">
                  <label className="form-label">
                    2. Short Title: <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Deep pothole in front of Lincoln Elementary School"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={`form-input ${errors.title ? 'error' : ''}`}
                    style={{ fontSize: '0.9rem', height: '42px' }}
                  />
                  {errors.title && <div className="form-error-msg">{errors.title}</div>}
                </div>

                {/* 3. Location / Locality */}
                <div className="form-group">
                  <label className="form-label">
                    3. General Location or Locality: <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Brodipet 4th Lane, near Krishna Temple, Guntur"
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    className={`form-input ${errors.locality ? 'error' : ''}`}
                    style={{ fontSize: '0.9rem', height: '42px' }}
                  />
                  {errors.locality && <div className="form-error-msg">{errors.locality}</div>}
                  <p className="form-hint">Tip: Adding nearby landmarks or cross-streets helps municipal teams locate it quickly.</p>
                </div>

                {/* 4. Description */}
                <div className="form-group">
                  <label className="form-label">
                    4. Description: <span className="required">*</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g., The pothole is about 10 inches deep. School children on bicycles are swerving into oncoming traffic to avoid it..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={`form-textarea ${errors.description ? 'error' : ''}`}
                    style={{ fontSize: '0.875rem' }}
                  />
                  {errors.description && <div className="form-error-msg">{errors.description}</div>}
                </div>

                {/* 5. Optional Photo Upload */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }} id="form-grid-extras">
                  <div>
                    <label className="form-label">
                      Attach Photo <span className="text-muted" style={{ fontWeight: 400 }}>(Optional)</span>
                    </label>

                    {imagePreview ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem', borderRadius: '8px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
                        <img
                          src={imagePreview}
                          alt="Uploaded preview"
                          style={{ width: '60px', height: '45px', objectFit: 'cover', borderRadius: '6px' }}
                        />
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0F172A' }}>Photo Added</p>
                        </div>
                        <button onClick={removeImage} className="btn btn-danger btn-sm" type="button" style={{ padding: '0.25rem 0.5rem' }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => document.getElementById('photo-upload-input')?.click()}
                        className="btn btn-secondary"
                        style={{ width: '100%', height: '42px', justifyContent: 'center', gap: '0.4rem', fontSize: '0.825rem' }}
                      >
                        <Camera size={16} style={{ color: '#2563EB' }} />
                        <span>Upload Picture</span>
                      </button>
                    )}
                    <input
                      id="photo-upload-input"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: 'none' }}
                    />
                    {errors.image && <div className="form-error-msg">{errors.image}</div>}
                  </div>

                  <div>
                    <label className="form-label">
                      Who is affected? <span className="text-muted" style={{ fontWeight: 400 }}>(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., School children, 300+ commuters"
                      value={affectedEstimate}
                      onChange={(e) => setAffectedEstimate(e.target.value)}
                      className="form-input"
                      style={{ height: '42px', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                {/* AI Assistant Action */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <button
                    type="button"
                    onClick={handleRunAiAnalysis}
                    disabled={isAnalyzing}
                    className="btn btn-secondary"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      borderColor: '#93C5FD',
                      color: '#1D4ED8',
                      backgroundColor: '#EFF6FF'
                    }}
                    id="btn-analyze-ai"
                  >
                    <Sparkles size={16} />
                    <span>{isAnalyzing ? 'Analyzing issue with AI helper...' : 'Analyze Issue with AI (See Urgency & Department)'}</span>
                  </button>
                  {aiError && <div className="form-error-msg">{aiError}</div>}
                </div>

                {/* Plain English AI Results Card */}
                {aiResult && (
                  <div
                    style={{
                      padding: '1.2rem',
                      borderRadius: '12px',
                      backgroundColor: '#EFF6FF',
                      border: '1px solid #BFDBFE',
                      marginBottom: '1rem',
                      animation: 'slideUp 180ms ease'
                    }}
                  >
                    {/* Header with Source */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Sparkles size={16} style={{ color: '#2563EB' }} />
                        <strong style={{ fontSize: '0.9rem', color: '#1E40AF' }}>
                          AI Assessment Results
                        </strong>
                      </div>
                      <AiSourceBadge source={aiResult.source} isRealAi={aiResult.isRealAi} />
                    </div>

                    {/* Summary Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '0.85rem' }}>
                      <div style={{ backgroundColor: '#FFFFFF', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #DBEAFE' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span className="text-muted" style={{ fontSize: '0.72rem', textTransform: 'uppercase' }}>Problem Type</span>
                          {aiResult.predictedCategory !== category && (
                            <button
                              type="button"
                              onClick={applyAiCategory}
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: '0.68rem', padding: '0.15rem 0.4rem', borderColor: '#93C5FD', color: '#1E40AF' }}
                            >
                              <Check size={11} />
                              <span>Apply AI</span>
                            </button>
                          )}
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0F172A', marginTop: '2px' }}>
                          {aiResult.predictedCategory}
                        </div>
                      </div>

                      <div style={{ backgroundColor: '#FFFFFF', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #DBEAFE' }}>
                        <span className="text-muted" style={{ fontSize: '0.72rem', textTransform: 'uppercase' }}>Urgency Level</span>
                        <div style={{ marginTop: '2px' }}>
                          <PriorityBadge priority={aiResult.priority} />
                        </div>
                      </div>
                    </div>

                    {/* Responsible Department & Action */}
                    <div style={{ backgroundColor: '#FFFFFF', padding: '0.85rem', borderRadius: '8px', border: '1px solid #DBEAFE', marginBottom: '0.75rem', fontSize: '0.825rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#1E40AF', fontWeight: 700, marginBottom: '0.3rem' }}>
                        <Building size={14} />
                        <span>Responsible Department: {aiResult.department}</span>
                      </div>
                      <p style={{ color: '#0F172A', lineHeight: 1.45 }}>
                        <strong>Recommended Action:</strong> {aiResult.recommendedAction}
                      </p>
                    </div>

                    {/* Plain English Explanation */}
                    <p style={{ fontSize: '0.8rem', color: '#334155', lineHeight: 1.45 }}>
                      <strong>Why this matters:</strong> {aiResult.explanation}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer (Hidden when submitted) */}
          {!submittedReport && (
            <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
              <button type="button" onClick={handleCloseModal} className="btn btn-secondary">
                Cancel
              </button>

              <button
                type="button"
                onClick={() => handleSubmit(false)}
                disabled={rateLimitSeconds > 0}
                className="btn btn-blue btn-lg"
                style={{ fontWeight: 700, padding: '0.75rem 1.8rem' }}
                id="btn-submit-report-final"
              >
                <span>{rateLimitSeconds > 0 ? `Wait (${rateLimitSeconds}s)` : 'Submit Report'}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          )}

          <style>{`
            @media (max-width: 640px) {
              #form-grid-extras {
                grid-template-columns: 1fr !important;
              }
            }
          `}</style>
        </div>
      </div>

      {/* Duplicate Warning Modal */}
      {showDuplicateModal && duplicateMatch && (
        <DuplicateModal
          isOpen={showDuplicateModal}
          onClose={() => setShowDuplicateModal(false)}
          candidateReport={{
            title,
            description,
            category,
            locality
          }}
          matchingReport={duplicateMatch.matchingReport}
          matchScore={duplicateMatch.matchScore}
          matchReasons={duplicateMatch.reasons}
          onSubmitAnyway={() => {
            setShowDuplicateModal(false);
            handleSubmit(true);
          }}
          onViewExisting={() => {
            handleCloseModal();
          }}
        />
      )}
    </>
  );
}
