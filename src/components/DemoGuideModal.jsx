import React from 'react';
import { 
  X, 
  Sparkles, 
  CheckCircle, 
  ShieldCheck, 
  Layers, 
  TrendingUp
} from 'lucide-react';

export function DemoGuideModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-dialog modal-dialog-large">
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
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="heading-2">About CommunityPulse AI</h2>
              <p className="text-muted" style={{ fontSize: '0.8rem' }}>
                Challenge Theme: “AI for Better Living & Smarter Communities”
              </p>
            </div>
          </div>

          <button onClick={onClose} className="btn btn-secondary btn-sm" aria-label="Close dialog">
            <X size={16} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Mission & Impact */}
          <div style={{ padding: '1rem', borderRadius: '12px', backgroundColor: '#F0FDFA', border: '1px solid #CCFBF1' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F766E', marginBottom: '0.35rem' }}>
              Project Mission & Community Impact
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#115E59', lineHeight: 1.5 }}>
              Municipal authorities receive hundreds of citizen 311 reports daily, yet critical life-safety hazards (broken gas lines, road collapses near schools, burst water mains) frequently languish in chronological queues behind cosmetic complaints. <strong>CommunityPulse AI</strong> revolutionizes civic triage with explainable predictive prioritization, proactive duplicate suppression, and neighborhood telemetry to ensure cities respond to urgency rather than just complaint volume.
            </p>
          </div>

          {/* Key Features Overview */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            <div style={{ padding: '0.85rem', borderRadius: '10px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0D9488', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                <CheckCircle size={15} />
                <span>Dual-Tier AI Engine</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.45 }}>
                Directly integrates with Google Gemini 2.5 Flash when an API key is provided, paired with a deterministic, zero-configuration local NLP & heuristics engine that runs completely offline with 100% transparency.
              </p>
            </div>

            <div style={{ padding: '0.85rem', borderRadius: '10px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0D9488', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                <ShieldCheck size={15} />
                <span>5-Dimensional Prioritization</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.45 }}>
                Scores issues from 0 to 100 based on physical safety risk (30 pts), vulnerable population proximity (25 pts), environmental contamination (20 pts), duration (15 pts), and textual urgency indicators (10 pts).
              </p>
            </div>

            <div style={{ padding: '0.85rem', borderRadius: '10px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0D9488', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                <Layers size={15} />
                <span>Explainable Duplicate Detection</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.45 }}>
                Compares normalized descriptions, categories, and locality tokens to surface side-by-side duplicate alerts before submission, without ever deleting or discarding citizen submissions without consent.
              </p>
            </div>

            <div style={{ padding: '0.85rem', borderRadius: '10px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0D9488', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                <TrendingUp size={15} />
                <span>Preventive Community Insights</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.45 }}>
                Derives real-time municipal recommendations, identifying infrastructure bottlenecks and hotspot neighborhoods to shift civic operations from reactive patching to proactive prevention.
              </p>
            </div>
          </div>

          {/* Verification & Testing Tips */}
          <div className="cp-card" style={{ backgroundColor: '#FFFFFF' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.5rem' }}>
              Quick Testing & Verification Steps:
            </h4>
            <ol style={{ paddingLeft: '1.25rem', fontSize: '0.8rem', color: '#334155', lineHeight: 1.6 }}>
              <li>
                <strong>Try Reporting a Safe vs Dangerous Issue:</strong> Click <em>"Report an Issue"</em> and type <em>"Water pipe burst on Market Square flooding roadway"</em>. Click <em>"Analyze Issue with AI"</em> to see it scored as <strong>Critical</strong> with safety hazard flags and Water Authority assignment.
              </li>
              <li>
                <strong>Trigger Duplicate Detection:</strong> Submit a report with title <em>"Broken water pipe gushing"</em> and location <em>"Market Square"</em>. The system will detect the existing #CP-801 report and open the side-by-side comparison modal!
              </li>
              <li>
                <strong>Update Status & Add Inspection Notes:</strong> Open any report from the Directory, click <em>"In Progress"</em> or <em>"Resolved"</em>, post an inspection note, and watch the Analytics charts update in real time.
              </li>
              <li>
                <strong>Configure Gemini API (Optional):</strong> Click the API button in the header to enter a Google Gemini key. Test connection verification live, or leave blank to enjoy the instant offline rules engine.
              </li>
            </ol>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-primary">
            Explore CommunityPulse AI
          </button>
        </div>
      </div>
    </div>
  );
}
