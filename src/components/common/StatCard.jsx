import React from 'react';

export function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
  trend,
  color = 'teal',
  onClick
}) {
  const colorMap = {
    teal: { bg: '#F0FDFA', text: '#0D9488', border: '#CCFBF1' },
    red: { bg: '#FEF2F2', text: '#DC2626', border: '#FEE2E2' },
    orange: { bg: '#FFF7ED', text: '#EA580C', border: '#FFEDD5' },
    blue: { bg: '#F0F9FF', text: '#0284C7', border: '#E0F2FE' },
    green: { bg: '#F0FDF4', text: '#16A34A', border: '#DCFCE7' }
  };

  const scheme = colorMap[color] || colorMap.teal;

  return (
    <div
      className={`cp-card ${onClick ? 'cp-card-interactive' : ''}`}
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '115px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p className="text-muted" style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {label}
          </p>
          <h3 style={{ fontSize: '1.9rem', fontWeight: 700, color: '#0F172A', marginTop: '0.2rem', lineHeight: 1.1 }}>
            {value}
          </h3>
        </div>
        {Icon && (
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: scheme.bg,
              color: scheme.text,
              border: `1px solid ${scheme.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Icon size={22} />
          </div>
        )}
      </div>

      {(subtext || trend) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.75rem', fontSize: '0.75rem' }}>
          {trend && (
            <span style={{ fontWeight: 600, color: scheme.text }}>
              {trend}
            </span>
          )}
          {subtext && <span className="text-muted">{subtext}</span>}
        </div>
      )}
    </div>
  );
}
