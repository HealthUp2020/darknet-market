import React from 'react';

const KINDS = {
  error:   { c: 'var(--sys-error)', bg: 'var(--sys-error-glass)', border: 'var(--sys-error-border)', prefix: 'SYS.ERR' },
  success: { c: 'var(--sys-success)', bg: 'var(--sys-success-glass)', border: 'var(--sys-success-border)', prefix: 'SYS.OK' },
  info:    { c: 'var(--accent-ui)', bg: 'var(--accent-ui-glass)', border: 'rgba(79,195,217,0.40)', prefix: 'SYS.MSG' },
};

export function SystemBanner({ kind = 'error', code, children, onDismiss, style }) {
  const k = KINDS[kind] || KINDS.error;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '9px 14px', boxSizing: 'border-box',
      background: k.bg, border: `1px solid ${k.border}`,
      backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
      clipPath: 'var(--clip-btn)',
      ...style,
    }}>
      <span style={{ font: '600 10px/1 var(--font-mono)', letterSpacing: '0.08em', color: k.c, flexShrink: 0 }}>
        {k.prefix}{code ? ` ${code}` : ''} //
      </span>
      <span style={{ font: '400 12px/1.4 var(--font-body)', color: 'var(--text-primary)', flex: 1 }}>{children}</span>
      {onDismiss ? (
        <button onClick={onDismiss} style={{ background: 'none', border: 'none', cursor: 'pointer', font: '500 11px/1 var(--font-mono)', color: 'var(--text-muted)', padding: 2 }}>[x]</button>
      ) : null}
    </div>
  );
}
