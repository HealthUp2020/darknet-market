import React from 'react';

export function GlassPanel({ title = 'PANEL', status, active = false, width, style, children }) {
  const dot = active ? 'var(--accent-ui)' : 'var(--text-muted)';
  return (
    <div style={{
      position: 'relative', width, boxSizing: 'border-box',
      background: 'var(--glass-bg)',
      backdropFilter: 'var(--glass-blur)', WebkitBackdropFilter: 'var(--glass-blur)',
      border: `1px solid ${active ? 'rgba(79,195,217,0.55)' : 'var(--glass-border-color)'}`,
      clipPath: 'var(--clip-panel)',
      boxShadow: active ? 'var(--glow-ui), var(--shadow-panel)' : 'var(--shadow-panel)',
      transition: 'box-shadow var(--dur) var(--ease-hud), border-color var(--dur) var(--ease-hud)',
      ...style,
    }}>
      <div style={{ position: 'absolute', inset: 0, background: 'var(--glass-highlight)', pointerEvents: 'none' }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '10px 14px', borderBottom: '1px solid var(--border-subtle)' }}>
        <span style={{
          font: '600 11px/1 var(--font-display)', letterSpacing: '0.18em', textTransform: 'uppercase',
          color: active ? 'var(--accent-ui)' : 'var(--text-secondary)',
          textShadow: active ? 'var(--glow-text-ui)' : 'none',
        }}>{title}</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: dot, boxShadow: active ? 'var(--glow-ui)' : 'none', animation: active ? 'ds-pulse 1.6s var(--ease-hud) infinite' : 'none' }} />
          <span style={{ font: '500 9px/1 var(--font-mono)', letterSpacing: '0.12em', color: active ? 'var(--accent-ui)' : 'var(--text-muted)' }}>{status || (active ? 'ACTIVE' : 'IDLE')}</span>
        </span>
      </div>
      <div style={{ position: 'relative', padding: 'var(--pad-panel)' }}>{children}</div>
    </div>
  );
}
