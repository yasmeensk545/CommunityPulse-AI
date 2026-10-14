import React, { useState } from 'react';
import { Lock, Shield, KeyRound, AlertCircle, ArrowLeft } from 'lucide-react';
import { storageService } from '../services/storage.js';

export function DepartmentLoginView({ onLoginSuccess, onNavigateHome }) {
  const [staffId, setStaffId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!staffId.trim() || !password.trim()) {
      setError('Please enter both your Staff ID and Password.');
      return;
    }

    setIsLoading(true);
    const result = storageService.loginStaff(staffId, password);

    setTimeout(() => {
      setIsLoading(false);
      if (result.success) {
        onLoginSuccess(result.session);
      } else {
        setError(result.error || 'Authentication failed. Please verify credentials.');
      }
    }, 250);
  };

  const handleFillDemo = () => {
    setStaffId('STAFF-01');
    setPassword('admin123');
    setError('');
  };

  return (
    <div style={{ maxWidth: '480px', margin: '3rem auto', padding: '0 1rem' }}>
      {/* Return to Citizen Home Link */}
      <div style={{ marginBottom: '1.5rem' }}>
        <button
          onClick={onNavigateHome}
          className="btn btn-secondary btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}
        >
          <ArrowLeft size={14} />
          <span>Return to Citizen Home</span>
        </button>
      </div>

      <div
        className="cp-card"
        style={{
          padding: '2rem 2.25rem',
          borderRadius: '16px',
          boxShadow: 'var(--shadow-lg)',
          borderTop: '5px solid #2563EB'
        }}
      >
        {/* Header with Lock Icon */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              backgroundColor: '#EFF6FF',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              boxShadow: '0 4px 10px rgba(37, 99, 235, 0.15)'
            }}
          >
            <Lock size={26} />
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: '#FEF3C7',
              color: '#92400E',
              padding: '0.2rem 0.65rem',
              borderRadius: '9999px',
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: '0.5rem'
            }}
          >
            <Shield size={12} />
            <span>Authorized Staff Only</span>
          </div>

          <h1 className="heading-1" style={{ fontSize: '1.5rem', color: '#0F172A', marginBottom: '0.25rem' }}>
            Department Staff Portal
          </h1>
          <p className="text-muted" style={{ fontSize: '0.84rem' }}>
            Coordinate field operations, update ticket statuses, and log internal inspection notes.
          </p>
        </div>

        {/* Demo Credentials Helper Box */}
        <div
          style={{
            backgroundColor: '#F8FAFC',
            border: '1px dashed #CBD5E1',
            borderRadius: '10px',
            padding: '0.85rem 1rem',
            marginBottom: '1.5rem',
            fontSize: '0.8rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ fontWeight: 700, color: '#334155' }}>Demo Access Credentials:</span>
            <button
              type="button"
              onClick={handleFillDemo}
              style={{
                fontSize: '0.75rem',
                color: '#2563EB',
                fontWeight: 600,
                textDecoration: 'underline'
              }}
            >
              Auto-fill credentials
            </button>
          </div>
          <div style={{ display: 'flex', gap: '1rem', color: '#475569', fontSize: '0.78rem' }}>
            <span>Staff ID: <strong style={{ color: '#0F172A', fontFamily: 'monospace' }}>STAFF-01</strong></span>
            <span>Password: <strong style={{ color: '#0F172A', fontFamily: 'monospace' }}>admin123</strong></span>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div
            style={{
              backgroundColor: '#FEF2F2',
              border: '1px solid #FCA5A5',
              color: '#991B1B',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              marginBottom: '1.25rem',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '1.1rem' }}>
            <label className="form-label" htmlFor="staff-id-input">
              Staff ID Number <span className="required">*</span>
            </label>
            <input
              id="staff-id-input"
              type="text"
              className="form-input"
              placeholder="e.g. STAFF-01"
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              style={{ height: '44px', borderRadius: '8px' }}
              autoComplete="username"
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" htmlFor="staff-password-input">
              Password <span className="required">*</span>
            </label>
            <input
              id="staff-password-input"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ height: '44px', borderRadius: '8px' }}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-blue btn-lg"
            style={{ width: '100%', borderRadius: '10px', height: '46px', fontSize: '0.95rem' }}
            disabled={isLoading}
            id="department-login-submit-btn"
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <KeyRound size={17} />
                <span>Log In to Department Portal</span>
              </span>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.75rem', color: '#64748B' }}>
          <span>Demo prototype for municipal operations. Citizens do not require a login.</span>
        </div>
      </div>
    </div>
  );
}
