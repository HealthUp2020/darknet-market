import React from 'react';

const ACCENTS = {
  cyan:    { tier: 'rare', c: 'var(--rare-cyan)', glass: 'var(--rare-cyan-glass)', glow: 'var(--glow-cyan)' },
  gold:    { tier: 'rare', c: 'var(--rare-gold)', glass: 'var(--rare-gold-glass)', glow: 'var(--glow-gold)' },
  magenta: { tier: 'rare', c: 'var(--rare-magenta)', glass: 'var(--rare-magenta-glass)', glow: 'var(--glow-magenta)' },
  purple:  { tier: 'common', c: 'var(--common-purple)', glass: 'var(--common-purple-glass)' },
  green:   { tier: 'common', c: 'var(--common-green)', glass: 'var(--common-green-glass)' },
  orange:  { tier: 'common', c: 'var(--common-orange)', glass: 'var(--common-orange-glass)' },
};

export function GameCard({ accent = 'green', name = 'UNKNOWN', type, value = 1, illustration = null, selected = false, disabled = false, width = 150, onClick, style }) {
  const a = ACCENTS[accent] || ACCENTS.green;
  const rare = a.tier === 'rare';
  const h = Math.round(width * 1.4);
  const border = rare ? a.c : `color-mix(in srgb, ${a.c} 55%, transparent)`;
  let shadow = 'none';
  if (!disabled) {
    if (rare && selected) shadow = `${'var(--glow-ui)'}, ${a.glow}`;
    else if (rare) shadow = a.glow;
    else if (selected) shadow = 'var(--glow-ui)';
  }
  const pips = rare ? 3 : 1;
  return (
    <div
      onClick={disabled ? undefined : onClick}
      style={{
        position: 'relative', width, height: h, boxSizing: 'border-box',
        display: 'flex', flexDirection: 'column',
        background: 'var(--bg-panel)',
        border: `1px solid ${selected ? 'var(--accent-ui)' : border}`,
        clipPath: 'var(--clip-card)',
        boxShadow: shadow,
        transform: selected ? 'translateY(-6px)' : 'none',
        opacity: disabled ? 'var(--disabled-opacity)' : 1,
        filter: disabled ? 'var(--disabled-filter)' : 'none',
        cursor: onClick && !disabled ? 'pointer' : 'default',
        transition: 'transform var(--dur) var(--ease-hud), box-shadow var(--dur) var(--ease-hud)',
        ...style,
      }}
    >
      {/* cut-corner fill */}
      <div style={{ position: 'absolute', top: 0, right: 0, width: 'var(--cut)', height: 'var(--cut)', background: a.glass, borderLeft: `1px solid ${border}`, pointerEvents: 'none' }} />
      {rare ? <div style={{ position: 'absolute', inset: 3, border: `1px solid color-mix(in srgb, ${a.c} 35%, transparent)`, clipPath: 'var(--clip-card)', pointerEvents: 'none' }} /> : null}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', gap: 6 }}>
        <span style={{ font: '600 11px/1.15 var(--font-display)', letterSpacing: '0.08em', textTransform: 'uppercase', color: rare ? a.c : 'var(--text-primary)', textShadow: rare && !disabled ? `0 0 8px color-mix(in srgb, ${a.c} 60%, transparent)` : 'none' }}>{name}</span>
        <span style={{ display: 'flex', gap: 3, marginRight: 8, flexShrink: 0 }}>
          {Array.from({ length: pips }).map((_, i) => (
            <span key={i} style={{ width: 5, height: 5, background: a.c, transform: 'rotate(45deg)' }} />
          ))}
        </span>
      </div>
      <div style={{
        flex: 1, margin: '0 1px',
        background: `var(--texture-scanline), repeating-linear-gradient(135deg, var(--bg-inset) 0px, var(--bg-inset) 10px, #0b1018 10px, #0b1018 20px)`,
        borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)',
        display: 'grid', placeItems: 'center', overflow: 'hidden',
      }}>
        {illustration || <span style={{ font: '400 8px/1 var(--font-mono)', letterSpacing: '0.14em', color: 'var(--text-muted)' }}>ILLUSTRATION</span>}
      </div>
      <div style={{ padding: '7px 10px 9px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 6 }}>
        <span style={{ font: '600 8px/1.3 var(--font-display)', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{type || (rare ? 'Rare // Restricted' : 'Common // Trade good')}</span>
        <span style={{ font: '600 16px/1 var(--font-mono)', color: a.c, flexShrink: 0 }}>{value}</span>
      </div>
      <div style={{ position: 'absolute', left: 0, bottom: 0, width: 18, height: 2, background: a.c, pointerEvents: 'none' }} />
    </div>
  );
}
