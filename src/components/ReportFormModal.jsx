import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Upload, 
  Check, 
  ArrowRight, 
  Building, 
  Trash2
} from 'lucide-react';
import { VALID_CATEGORIES } from '../services/storage.js';
import { analyzeCivicIssue } from '../services/aiService.js';
import { checkDuplicate } from '../services/duplicateDetector.js';
import { PriorityBadge, AiSourceBadge } from './common/Badge.jsx';
import { DuplicateModal } from './DuplicateModal.jsx';

function createNewReportId() {
  return `CP-${Math.floor(100 + Math.random() * 900)}`;
}

export function ReportFormModal({
  isOpen,
  onClose,
  onSubmitSuccess,
  existingReports = []
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locality, setLocality] = useState('');
  const [category, setCategory] = useState('Road Damage');
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

  if (!isOpen) return null;

  // Handle local image file preview
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: 'Image size must be under 3 MB.' }));
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
    if (!title.trim()) fieldErrors.title = 'Please provide an issue title before analyzing.';
    if (!description.trim() || description.trim().length < 10) {
      fieldErrors.description = 'Please write at least 10 characters describing the issue.';
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
        locality: locality || 'Unspecified location',
        category,
        affectedEstimate
      });
      setAiResult(result);
    } catch (err) {
      console.error('AI Analysis failed:', err);
      setAiError('Failed to complete AI analysis. You can still submit the report.');
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
      newErrors.title = 'Issue title is required.';
    } else if (title.trim().length < 5) {
      newErrors.title = 'Title must be at least 5 characters long.';
    }

    if (!description.trim()) {
      newErrors.description = 'Detailed description is required.';
    } else if (description.trim().length < 15) {
      newErrors.description = 'Please provide more details (at least 15 characters).';
    }

    if (!locality.trim()) {
      newErrors.locality = 'Neighborhood or locality address is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetAndClose = () => {
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
    onClose();
  };

  // Submit Handler
  const handleSubmit = async (overrideDuplicate = false) => {
    if (!validateForm()) return;

    // Build report payload
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
    const candidatePayload = {
      id: createNewReportId(),
      title: title.trim(),
      description: description.trim(),
      locality: locality.trim(),
      category: category,
      priority: finalAi.priority,
      priorityScore: finalAi.priorityScore,
      status: 'Reported',
      reportedBy: 'Civic Reporter (You)',
      affectedEstimate: affectedEstimate.trim() || 'Immediate neighborhood',
      imageUrl: imageUrl || '',
      isSample: false,
      createdAt: nowIso,
      updatedAt: nowIso,
      aiAnalysis: finalAi,
      resolutionNotes: []
    };

    // If not overriding, run duplicate detection
    if (!overrideDuplicate) {
      const dupCheck = checkDuplicate(candidatePayload, existingReports, 45);
      if (dupCheck.isDuplicate) {
        setDuplicateMatch(dupCheck);
        setShowDuplicateModal(true);
        return;
      }
    }

    // Save report
    onSubmitSuccess(candidatePayload);
    handleResetAndClose();
  };

  return (
    <>
      <div className="modal-overlay">
        <div className="modal-dialog modal-dialog-large">
          {/* Header */}
          <div className="modal-header">
            <div>
              <h2 className="heading-2">Report a Community Issue</h2>
              <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '2px' }}>
                Leverage predictive AI prioritization to dispatch local municipal services faster.
              </p>
            </div>
            <button onClick={handleResetAndClose} className="btn btn-secondary btn-sm" aria-label="Close dialog">
              <X size={16} />
            </button>
          </div>

          {/* Form Body */}
          <div className="modal-body">
            {/* Top row: Title & Category */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }} id="form-grid-top">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">
                  Issue Title <span className="required">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Deep asphalt pothole blocking school crossing"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`form-input ${errors.title ? 'error' : ''}`}
                />
                {errors.title && <div className="form-error-msg">{errors.title}</div>}
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">
                  Category <span className="required">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="form-select"
                >
                  {VALID_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">
                Detailed Description <span className="required">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Describe what happened, hazards observed, how long it has persisted, and any ongoing risks..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`form-textarea ${errors.description ? 'error' : ''}`}
              />
              {errors.description && <div className="form-error-msg">{errors.description}</div>}
              <p className="form-hint">Tip: Mention safety risks (flooding, electrical, traffic hazards) for accurate AI triage.</p>
            </div>

            {/* Locality & Affected Estimate */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem', marginBottom: '1.25rem' }} id="form-grid-middle">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">
                  Neighborhood / Locality Address <span className="required">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Oakwood Ave & 4th St (Near Lincoln Park)"
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  className={`form-input ${errors.locality ? 'error' : ''}`}
                />
                {errors.locality && <div className="form-error-msg">{errors.locality}</div>}
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">
                  Estimated People Affected <span className="text-muted" style={{ fontWeight: 400 }}>(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., 200+ commuters, school route"
                  value={affectedEstimate}
                  onChange={(e) => setAffectedEstimate(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            {/* Optional Photo Attachment */}
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label">
                Attach Photo Evidence <span className="text-muted" style={{ fontWeight: 400 }}>(Optional)</span>
              </label>

              {imagePreview ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
                  <img
                    src={imagePreview}
                    alt="Uploaded preview"
                    style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '6px' }}
                  />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0F172A' }}>Photo Attached</p>
                    <p className="text-muted" style={{ fontSize: '0.72rem' }}>Visible to municipal field dispatchers</p>
                  </div>
                  <button onClick={removeImage} className="btn btn-danger btn-sm" type="button">
                    <Trash2 size={13} />
                    <span>Remove</span>
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    border: '1.5px dashed #CBD5E1',
                    borderRadius: '10px',
                    padding: '1rem',
                    textAlign: 'center',
                    backgroundColor: '#F8FAFC',
                    cursor: 'pointer'
                  }}
                  onClick={() => document.getElementById('photo-upload-input')?.click()}
                >
                  <Upload size={20} style={{ color: '#0D9488', margin: '0 auto 0.25rem' }} />
                  <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>Click to upload scene photo</p>
                  <p className="text-muted" style={{ fontSize: '0.72rem' }}>PNG, JPG or WEBP (Max 3 MB)</p>
                  <input
                    id="photo-upload-input"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                </div>
              )}
              {errors.image && <div className="form-error-msg">{errors.image}</div>}
            </div>

            {/* AI Analysis Trigger Button */}
            <div style={{ marginBottom: '1.25rem' }}>
              <button
                type="button"
                onClick={handleRunAiAnalysis}
                disabled={isAnalyzing}
                className="btn btn-teal-outline"
                style={{ width: '100%', padding: '0.75rem', fontSize: '0.875rem', fontWeight: 600 }}
              >
                <Sparkles size={16} />
                <span>{isAnalyzing ? 'Analyzing Issue with AI Engine...' : 'Analyze Issue with AI Prioritization Engine'}</span>
              </button>
              {aiError && <div className="form-error-msg">{aiError}</div>}
            </div>

            {/* AI Analysis Result Card */}
            {aiResult && (
              <div
                style={{
                  padding: '1.1rem',
                  borderRadius: '12px',
                  backgroundColor: '#F0FDFA',
                  border: '1px solid #99F6E4',
                  marginBottom: '1rem',
                  animation: 'slideUp 180ms ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Sparkles size={16} style={{ color: '#0D9488' }} />
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0F766E' }}>
                      AI Predictive Assessment
                    </span>
                  </div>
                  <AiSourceBadge source={aiResult.source} isRealAi={aiResult.isRealAi} />
                </div>

                {/* Score & Priority line */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', color: '#134E4A' }}>Calculated Urgency:</span>
                    <PriorityBadge priority={aiResult.priority} showScore={true} score={aiResult.priorityScore} />
                  </div>

                  {aiResult.predictedCategory !== category && (
                    <button
                      type="button"
                      onClick={applyAiCategory}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem', borderColor: '#99F6E4', color: '#0F766E' }}
                    >
                      <span>Suggested Category: <strong>{aiResult.predictedCategory}</strong> (Apply)</span>
                      <Check size={12} />
                    </button>
                  )}
                </div>

                {/* Department & Recommended Action */}
                <div style={{ backgroundColor: '#FFFFFF', padding: '0.75rem', borderRadius: '8px', border: '1px solid #CCFBF1', marginBottom: '0.75rem', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#0F766E', fontWeight: 600, marginBottom: '0.25rem' }}>
                    <Building size={14} />
                    <span>Assigned Department: {aiResult.department}</span>
                  </div>
                  <p style={{ color: '#0F172A', fontWeight: 500, lineHeight: 1.35 }}>
                    <strong>Recommended Next Action:</strong> {aiResult.recommendedAction}
                  </p>
                </div>

                {/* Explanation */}
                <p style={{ fontSize: '0.78rem', color: '#334155', lineHeight: 1.4, marginBottom: '0.65rem' }}>
                  <strong>Analysis:</strong> {aiResult.explanation}
                </p>

                {/* Safety & Environmental Details */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.73rem' }} id="ai-safety-split">
                  <div style={{ padding: '0.5rem', borderRadius: '6px', backgroundColor: '#FEF2F2', border: '1px solid #FEE2E2', color: '#991B1B' }}>
                    <strong>Safety Risk:</strong> {aiResult.safetyConcerns}
                  </div>
                  <div style={{ padding: '0.5rem', borderRadius: '6px', backgroundColor: '#F0FDF4', border: '1px solid #DCFCE7', color: '#166534' }}>
                    <strong>Environmental Impact:</strong> {aiResult.environmentalConcerns}
                  </div>
                </div>

                {/* Urgency Factor Chips */}
                {aiResult.urgencyFactors?.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.65rem' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#0F766E' }}>Key Factors:</span>
                    {aiResult.urgencyFactors.map((f, i) => (
                      <span key={i} style={{ fontSize: '0.68rem', backgroundColor: '#CCFBF1', color: '#0F766E', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                        {f}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button type="button" onClick={handleResetAndClose} className="btn btn-secondary">
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              className="btn btn-primary"
              style={{ fontWeight: 600 }}
              id="btn-submit-report-final"
            >
              <span>Submit Report</span>
              <ArrowRight size={15} />
            </button>
          </div>

          <style>{`
            @media (max-width: 640px) {
              #form-grid-top, #form-grid-middle, #ai-safety-split {
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
            handleResetAndClose();
          }}
        />
      )}
    </>
  );
}
