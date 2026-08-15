import React from 'react';

export function Button({ variant = 'gameplay', primary = false, size = 'md', disabled = false, children, onClick, style }) {
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  const sizes = { sm: ['6px 13px', 10], md: ['9px 18px', 11], lg: ['12px 26px', 12] };
  const [pad, fs] = sizes[size] || sizes.md;
  const sys = variant === 'system';
  const on = hover && !disabled;
  let bg, color, borderColor, shadow = 'none', textShadow = 'none';
  if (sys) {
    bg = on ? 'rgba(255,255,255,0.04)' : 'transparent';
    color = on ? 'var(--text-primary)' : 'var(--text-secondary)';
    borderColor = on ? 'var(--text-muted)' : 'var(--border-panel)';
  } else if (primary) {
    bg = press ? 'var(--accent-ui-dim)' : 'var(--accent-ui)';
    color = '#06131a';
    borderColor = 'var(--accent-ui)';
    if (on) shadow = 'var(--glow-ui)';
  } else {
    bg = press ? 'rgba(79,195,217,0.24)' : on ? 'rgba(79,195,217,0.16)' : 'var(--accent-ui-glass)';
    color = 'var(--accent-ui)';
    borderColor = 'rgba(79,195,217,0.55)';
    if (on) { shadow = 'var(--glow-ui)'; textShadow = 'var(--glow-text-ui)'; }
  }
  return (
    <button
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setPress(false); }}
      onMouseDown={() => setPress(true)}
      onMouseUp={() => setPress(false)}
      disabled={disabled}
      style={{
        font: `600 ${fs}px/1 ${sys ? 'var(--font-mono)' : 'var(--font-display)'}`,
        letterSpacing: sys ? '0.1em' : '0.16em',
        textTransform: 'uppercase',
        padding: pad,
        display: 'inline-flex', alignItems: 'center', gap: 8,
        background: bg, color,
        border: `1px solid ${borderColor}`,
        borderRadius: sys ? 'var(--radius-sm)' : 0,
        clipPath: sys ? 'none' : 'var(--clip-btn)',
        boxShadow: shadow, textShadow,
        transform: press && !disabled ? 'translateY(1px)' : 'none',
        opacity: disabled ? 'var(--disabled-opacity)' : 1,
        filter: disabled ? 'var(--disabled-filter)' : 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background var(--dur-fast) var(--ease-hud), box-shadow var(--dur) var(--ease-hud), color var(--dur-fast)',
        ...style,
      }}
    >{sys ? <span style={{ opacity: 0.6 }}>[</span> : null}{children}{sys ? <span style={{ opacity: 0.6 }}>]</span> : null}</button>
  );
}
