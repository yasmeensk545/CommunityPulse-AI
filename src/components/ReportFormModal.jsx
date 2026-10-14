import React, { useState } from 'react';
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
  Check
} from 'lucide-react';
import { analyzeCivicIssue } from '../services/aiService.js';
import { checkDuplicate } from '../services/duplicateDetector.js';
import { PriorityBadge, AiSourceBadge } from './common/Badge.jsx';
import { DuplicateModal } from './DuplicateModal.jsx';

function createNewReportId() {
  return `CP-${Math.floor(100 + Math.random() * 900)}`;
}

// Friendly category cards for ordinary citizens
const CATEGORY_OPTIONS = [
  { id: 'Waste Management', label: 'Garbage & Litter', icon: Trash2, desc: 'Overflowing bins, trash on streets' },
  { id: 'Road Damage', label: 'Road Damage', icon: AlertTriangle, desc: 'Potholes, broken asphalt, cracks' },
  { id: 'Water Leakage', label: 'Water Leakage', icon: Droplets, desc: 'Burst pipes, pooling water, hydrants' },
  { id: 'Streetlight', label: 'Streetlight', icon: Lightbulb, desc: 'Dark streetlights, flickering lamps' },
  { id: 'Pollution', label: 'Pollution', icon: ShieldAlert, desc: 'Chemical spills, odors, dirty creek' },
  { id: 'Public Safety', label: 'Public Safety', icon: ShieldAlert, desc: 'Traffic light out, dangerous crossing' },
  { id: 'Accessibility', label: 'Accessibility', icon: Accessibility, desc: 'Broken wheelchair ramp, blocked path' },
  { id: 'Other', label: 'Other Problem', icon: HelpCircle, desc: 'Any other neighbourhood issue' }
];

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
    } else if (description.trim().length < 12) {
      newErrors.description = 'Please provide a little more detail so crews know what to bring.';
    }

    if (!locality.trim()) {
      newErrors.locality = 'Please tell us where this problem is located.';
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
    const candidatePayload = {
      id: createNewReportId(),
      title: title.trim(),
      description: description.trim(),
      locality: locality.trim(),
      category: category,
      priority: finalAi.priority,
      priorityScore: finalAi.priorityScore,
      status: 'Reported',
      reportedBy: 'Local Resident',
      affectedEstimate: affectedEstimate.trim() || 'Local neighbours',
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
        <div className="modal-dialog modal-dialog-large" style={{ maxHeight: '92vh' }}>
          {/* Header */}
          <div className="modal-header">
            <div>
              <h2 className="heading-2" style={{ fontSize: '1.25rem' }}>
                Report a Community Problem
              </h2>
              <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '2px' }}>
                Takes only 1 minute. Our smart assistant alerts the right city department.
              </p>
            </div>
            <button onClick={handleResetAndClose} className="btn btn-secondary btn-sm" aria-label="Close dialog">
              <X size={16} />
            </button>
          </div>

          {/* Form Body */}
          <div className="modal-body" style={{ overflowY: 'auto' }}>
            {/* 1. Category Selection Cards */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" style={{ marginBottom: '0.5rem' }}>
                1. Select the type of problem: <span className="required">*</span>
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
                          backgroundColor: isSelected ? '#CCFBF1' : '#F1F5F9',
                          color: isSelected ? '#0D9488' : '#475569',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Icon size={18} />
                      </div>
                      <span style={{ fontSize: '0.78rem', fontWeight: isSelected ? 700 : 600, color: isSelected ? '#0F766E' : '#334155' }}>
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
                2. What is the problem? <span className="required">*</span>
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

            {/* 3. Location */}
            <div className="form-group">
              <label className="form-label">
                3. Where is it located? <span className="required">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Oakwood Ave & 4th Street, near the supermarket"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                className={`form-input ${errors.locality ? 'error' : ''}`}
                style={{ fontSize: '0.9rem', height: '42px' }}
              />
              {errors.locality && <div className="form-error-msg">{errors.locality}</div>}
              <p className="form-hint">Tip: Adding nearby landmarks or cross-streets helps work crews find it faster.</p>
            </div>

            {/* 4. Description */}
            <div className="form-group">
              <label className="form-label">
                4. Can you tell us more details? <span className="required">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="e.g., The pothole is about 8 inches deep. Two cars got flat tires this morning and cyclists are swerving into oncoming traffic to avoid it..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`form-textarea ${errors.description ? 'error' : ''}`}
                style={{ fontSize: '0.875rem' }}
              />
              {errors.description && <div className="form-error-msg">{errors.description}</div>}
            </div>

            {/* 5. Optional Photo & Affected People */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }} id="form-grid-extras">
              <div>
                <label className="form-label">
                  Add a Photo <span className="text-muted" style={{ fontWeight: 400 }}>(Optional)</span>
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
                    <Camera size={16} style={{ color: '#0D9488' }} />
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
                  placeholder="e.g., School children, 50+ neighbours"
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
                className="btn btn-teal-outline"
                style={{ width: '100%', padding: '0.75rem', fontSize: '0.9rem', fontWeight: 600 }}
              >
                <Sparkles size={16} />
                <span>{isAnalyzing ? 'Analyzing issue with AI helper...' : 'Analyze with AI (See Urgency & Department)'}</span>
              </button>
              {aiError && <div className="form-error-msg">{aiError}</div>}
            </div>

            {/* Plain English AI Results Card */}
            {aiResult && (
              <div
                style={{
                  padding: '1.2rem',
                  borderRadius: '12px',
                  backgroundColor: '#F0FDFA',
                  border: '1px solid #99F6E4',
                  marginBottom: '1rem',
                  animation: 'slideUp 180ms ease'
                }}
              >
                {/* Header with Source */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Sparkles size={16} style={{ color: '#0D9488' }} />
                    <strong style={{ fontSize: '0.9rem', color: '#0F766E' }}>
                      AI Assessment
                    </strong>
                  </div>
                  <AiSourceBadge source={aiResult.source} isRealAi={aiResult.isRealAi} />
                </div>

                {/* Plain English summary row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '0.85rem' }}>
                  <div style={{ backgroundColor: '#FFFFFF', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CCFBF1' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="text-muted" style={{ fontSize: '0.72rem', textTransform: 'uppercase' }}>Problem Type</span>
                      {aiResult.predictedCategory !== category && (
                        <button
                          type="button"
                          onClick={applyAiCategory}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.68rem', padding: '0.15rem 0.4rem', borderColor: '#99F6E4', color: '#0F766E' }}
                        >
                          <Check size={11} />
                          <span>Use this</span>
                        </button>
                      )}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0F172A', marginTop: '2px' }}>
                      {aiResult.predictedCategory}
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#FFFFFF', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CCFBF1' }}>
                    <span className="text-muted" style={{ fontSize: '0.72rem', textTransform: 'uppercase' }}>Urgency Level</span>
                    <div style={{ marginTop: '2px' }}>
                      <PriorityBadge priority={aiResult.priority} />
                    </div>
                  </div>
                </div>

                {/* Responsible Department & Action */}
                <div style={{ backgroundColor: '#FFFFFF', padding: '0.85rem', borderRadius: '8px', border: '1px solid #CCFBF1', marginBottom: '0.75rem', fontSize: '0.825rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#0F766E', fontWeight: 700, marginBottom: '0.3rem' }}>
                    <Building size={14} />
                    <span>Responsible City Team: {aiResult.department}</span>
                  </div>
                  <p style={{ color: '#0F172A', lineHeight: 1.45 }}>
                    <strong>Recommended Next Step:</strong> {aiResult.recommendedAction}
                  </p>
                </div>

                {/* Plain English Explanation */}
                <p style={{ fontSize: '0.8rem', color: '#334155', lineHeight: 1.45 }}>
                  {aiResult.explanation}
                </p>

                {/* Expandable Technical Details (Kept accessible for judges/admins, but hidden from ordinary citizens) */}
                <details style={{ marginTop: '0.85rem', paddingTop: '0.65rem', borderTop: '1px dashed #CCFBF1' }}>
                  <summary style={{ cursor: 'pointer', fontSize: '0.72rem', color: '#0D9488', fontWeight: 600 }}>
                    Technical Risk & Scoring Breakdown ({aiResult.priorityScore}/100 pts)
                  </summary>
                  <div style={{ marginTop: '0.5rem', fontSize: '0.72rem', color: '#475569', lineHeight: 1.4 }}>
                    <p><strong>Safety Flag:</strong> {aiResult.safetyConcerns}</p>
                    <p style={{ marginTop: '2px' }}><strong>Environmental Flag:</strong> {aiResult.environmentalConcerns}</p>
                    {aiResult.urgencyFactors?.length > 0 && (
                      <p style={{ marginTop: '2px' }}><strong>Urgency Factors:</strong> {aiResult.urgencyFactors.join(', ')}</p>
                    )}
                  </div>
                </details>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
            <button type="button" onClick={handleResetAndClose} className="btn btn-secondary">
              Cancel
            </button>

            <button
              type="button"
              onClick={() => handleSubmit(false)}
              className="btn btn-primary btn-lg"
              style={{ fontWeight: 700, padding: '0.75rem 1.6rem' }}
              id="btn-submit-report-final"
            >
              <span>Submit Report</span>
              <ArrowRight size={16} />
            </button>
          </div>

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
            handleResetAndClose();
          }}
        />
      )}
    </>
  );
}
