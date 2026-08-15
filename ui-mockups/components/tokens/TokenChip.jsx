import React from 'react';

const RARE = {
  cyan: ['var(--rare-cyan)', 'var(--glow-cyan)'],
  gold: ['var(--rare-gold)', 'var(--glow-gold)'],
  magenta: ['var(--rare-magenta)', 'var(--glow-magenta)'],
};

/* Three token families:
   value — circle, neutral machined chip, mono number (market value tokens)
   bonus — hexagon, accent-filled rim, glows (combo/bonus rewards)
   seal  — rotated-square diamond, magenta, kanji 印, strongest glow (unique special token) */
export function TokenChip({ kind = 'value', value = 5, label, size = 56, accent = 'gold', glow = true, disabled = false, style }) {
  const dim = disabled ? { opacity: 'var(--disabled-opacity)', filter: 'var(--disabled-filter)' } : {};
  if (kind === 'value') {
    return (
      <div style={{
        width: size, height: size, borderRadius: 'var(--radius-round)', boxSizing: 'border-box',
        background: 'radial-gradient(circle at 35% 30%, var(--bg-panel-raised), var(--bg-inset))',
        border: '2px solid var(--border-panel)',
        boxShadow: 'inset 0 0 0 3px var(--bg-page), inset 0 0 0 4px var(--border-subtle)',
        display: 'grid', placeItems: 'center', position: 'relative', ...dim, ...style,
      }}>
        <div style={{ position: 'absolute', top: 3, left: '50%', width: 2, height: 5, background: 'var(--accent-ui)', transform: 'translateX(-50%)' }} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          <span style={{ font: `600 ${Math.round(size * 0.32)}px/1 var(--font-mono)`, color: 'var(--text-primary)' }}>{value}</span>
          <span style={{ font: '600 7px/1 var(--font-display)', letterSpacing: '0.2em', color: 'var(--text-muted)' }}>{label || 'CR'}</span>
        </div>
      </div>
    );
  }
  if (kind === 'bonus') {
    const [c] = RARE[accent] || RARE.gold;
    const hex = 'polygon(25% 0, 75% 0, 100% 50%, 75% 100%, 25% 100%, 0 50%)';
    return (
      <div style={{ width: size * 1.08, height: size * 0.94, position: 'relative', filter: glow && !disabled ? `drop-shadow(0 0 7px color-mix(in srgb, ${c} 55%, transparent))` : 'none', ...dim, ...style }}>
        <div style={{ position: 'absolute', inset: 0, clipPath: hex, background: c }} />
        <div style={{ position: 'absolute', inset: 2, clipPath: hex, background: 'linear-gradient(160deg, var(--bg-panel-raised), var(--bg-inset))', display: 'grid', placeItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <span style={{ font: `600 ${Math.round(size * 0.3)}px/1 var(--font-mono)`, color: c }}>+{value}</span>
            <span style={{ font: '600 7px/1 var(--font-display)', letterSpacing: '0.2em', color: 'var(--text-muted)' }}>{label || 'BNS'}</span>
          </div>
        </div>
      </div>
    );
  }
  /* seal */
  const m = 'var(--rare-magenta)';
  return (
    <div style={{ width: size, height: size, display: 'grid', placeItems: 'center', ...dim, ...style }}>
      <div style={{
        width: size * 0.72, height: size * 0.72, transform: 'rotate(45deg)', boxSizing: 'border-box',
        border: `1px solid ${m}`, background: 'var(--rare-magenta-glass)',
        boxShadow: disabled ? 'none' : 'var(--glow-magenta)',
        display: 'grid', placeItems: 'center', position: 'relative',
      }}>
        <div style={{ position: 'absolute', inset: 4, border: '1px solid color-mix(in srgb, var(--rare-magenta) 40%, transparent)' }} />
        <span style={{ transform: 'rotate(-45deg)', font: `600 ${Math.round(size * 0.34)}px/1 var(--font-display)`, color: m, textShadow: disabled ? 'none' : '0 0 10px color-mix(in srgb, var(--rare-magenta) 70%, transparent)' }}>{label || '印'}</span>
      </div>
    </div>
  );
}
