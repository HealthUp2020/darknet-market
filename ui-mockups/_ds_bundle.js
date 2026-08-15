/* NIGHT MARKET — component bundle (plain JS, no build step). Exposes window.NightMarket */
(function () {
  const h = React.createElement;
  const useState = React.useState;

  function Button(props) {
    const { variant = 'gameplay', primary = false, size = 'md', disabled = false, children, onClick, style } = props;
    const [hover, setHover] = useState(false);
    const [press, setPress] = useState(false);
    const sizes = { sm: ['6px 13px', 10], md: ['9px 18px', 11], lg: ['12px 26px', 12] };
    const s = sizes[size] || sizes.md, pad = s[0], fs = s[1];
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
    return h('button', {
      onClick: disabled ? undefined : onClick,
      onMouseEnter: () => setHover(true),
      onMouseLeave: () => { setHover(false); setPress(false); },
      onMouseDown: () => setPress(true),
      onMouseUp: () => setPress(false),
      disabled,
      style: Object.assign({
        font: '600 ' + fs + 'px/1 ' + (sys ? 'var(--font-mono)' : 'var(--font-display)'),
        letterSpacing: sys ? '0.1em' : '0.16em', textTransform: 'uppercase', padding: pad,
        display: 'inline-flex', alignItems: 'center', gap: 8,
        background: bg, color, border: '1px solid ' + borderColor,
        borderRadius: sys ? 'var(--radius-sm)' : 0, clipPath: sys ? 'none' : 'var(--clip-btn)',
        boxShadow: shadow, textShadow,
        transform: press && !disabled ? 'translateY(1px)' : 'none',
        opacity: disabled ? 'var(--disabled-opacity)' : 1,
        filter: disabled ? 'var(--disabled-filter)' : 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background var(--dur-fast) var(--ease-hud), box-shadow var(--dur) var(--ease-hud), color var(--dur-fast)',
      }, style),
    }, sys ? h('span', { style: { opacity: 0.6 } }, '[') : null, children, sys ? h('span', { style: { opacity: 0.6 } }, ']') : null);
  }

  const ACCENTS = {
    cyan: { tier: 'rare', c: 'var(--rare-cyan)', glass: 'var(--rare-cyan-glass)', glow: 'var(--glow-cyan)' },
    gold: { tier: 'rare', c: 'var(--rare-gold)', glass: 'var(--rare-gold-glass)', glow: 'var(--glow-gold)' },
    magenta: { tier: 'rare', c: 'var(--rare-magenta)', glass: 'var(--rare-magenta-glass)', glow: 'var(--glow-magenta)' },
    purple: { tier: 'common', c: 'var(--common-purple)', glass: 'var(--common-purple-glass)' },
    green: { tier: 'common', c: 'var(--common-green)', glass: 'var(--common-green-glass)' },
    orange: { tier: 'common', c: 'var(--common-orange)', glass: 'var(--common-orange-glass)' },
  };

  function GameCard(props) {
    const { accent = 'green', name = 'UNKNOWN', type, value = 1, illustration = null, selected = false, disabled = false, width = 150, onClick, style } = props;
    const a = ACCENTS[accent] || ACCENTS.green;
    const rare = a.tier === 'rare';
    const ht = Math.round(width * 1.4);
    const border = rare ? a.c : 'color-mix(in srgb, ' + a.c + ' 55%, transparent)';
    let shadow = 'none';
    if (!disabled) {
      if (rare && selected) shadow = 'var(--glow-ui), ' + a.glow;
      else if (rare) shadow = a.glow;
      else if (selected) shadow = 'var(--glow-ui)';
    }
    const pips = rare ? 3 : 1;
    const pipEls = [];
    for (let i = 0; i < pips; i++) pipEls.push(h('span', { key: i, style: { width: 5, height: 5, background: a.c, transform: 'rotate(45deg)' } }));
    return h('div', {
      onClick: disabled ? undefined : onClick,
      style: Object.assign({
        position: 'relative', width, height: ht, boxSizing: 'border-box',
        display: 'flex', flexDirection: 'column', background: 'var(--bg-panel)',
        border: '1px solid ' + (selected ? 'var(--accent-ui)' : border),
        clipPath: 'var(--clip-card)', boxShadow: shadow,
        transform: selected ? 'translateY(-6px)' : 'none',
        opacity: disabled ? 'var(--disabled-opacity)' : 1,
        filter: disabled ? 'var(--disabled-filter)' : 'none',
        cursor: onClick && !disabled ? 'pointer' : 'default',
        transition: 'transform var(--dur) var(--ease-hud), box-shadow var(--dur) var(--ease-hud)',
      }, style),
    },
      h('div', { style: { position: 'absolute', top: 0, right: 0, width: 'var(--cut)', height: 'var(--cut)', background: a.glass, borderLeft: '1px solid ' + border, pointerEvents: 'none' } }),
      rare ? h('div', { style: { position: 'absolute', inset: 3, border: '1px solid color-mix(in srgb, ' + a.c + ' 35%, transparent)', clipPath: 'var(--clip-card)', pointerEvents: 'none' } }) : null,
      h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', gap: 6 } },
        h('span', { style: { font: '600 11px/1.15 var(--font-display)', letterSpacing: '0.08em', textTransform: 'uppercase', color: rare ? a.c : 'var(--text-primary)', textShadow: rare && !disabled ? '0 0 8px color-mix(in srgb, ' + a.c + ' 60%, transparent)' : 'none' } }, name),
        h('span', { style: { display: 'flex', gap: 3, marginRight: 8, flexShrink: 0 } }, pipEls)
      ),
      h('div', { style: { flex: 1, margin: '0 1px', background: 'var(--texture-scanline), repeating-linear-gradient(135deg, var(--bg-inset) 0px, var(--bg-inset) 10px, #23272e 10px, #23272e 20px)', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)', display: 'grid', placeItems: 'center', overflow: 'hidden' } },
        illustration || h('span', { style: { font: '400 8px/1 var(--font-mono)', letterSpacing: '0.14em', color: 'var(--text-muted)' } }, 'ILLUSTRATION')
      ),
      h('div', { style: { padding: '7px 10px 9px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 6 } },
        h('span', { style: { font: '600 8px/1.3 var(--font-display)', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-muted)' } }, type || (rare ? 'Rare // Restricted' : 'Common // Trade good')),
        h('span', { style: { font: '600 16px/1 var(--font-mono)', color: a.c, flexShrink: 0 } }, value)
      ),
      h('div', { style: { position: 'absolute', left: 0, bottom: 0, width: 18, height: 2, background: a.c, pointerEvents: 'none' } })
    );
  }

  const RARE = { cyan: 'var(--rare-cyan)', gold: 'var(--rare-gold)', magenta: 'var(--rare-magenta)' };

  function TokenChip(props) {
    const { kind = 'value', value = 5, label, size = 56, accent = 'gold', glow = true, disabled = false, style } = props;
    const dim = disabled ? { opacity: 'var(--disabled-opacity)', filter: 'var(--disabled-filter)' } : {};
    if (kind === 'value') {
      return h('div', { style: Object.assign({ width: size, height: size, borderRadius: 'var(--radius-round)', boxSizing: 'border-box', background: 'radial-gradient(circle at 35% 30%, var(--bg-panel-raised), var(--bg-inset))', border: '2px solid var(--border-panel)', boxShadow: 'inset 0 0 0 3px var(--bg-page), inset 0 0 0 4px var(--border-subtle)', display: 'grid', placeItems: 'center', position: 'relative' }, dim, style) },
        h('div', { style: { position: 'absolute', top: 3, left: '50%', width: 2, height: 5, background: 'var(--accent-ui)', transform: 'translateX(-50%)' } }),
        h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 } },
          h('span', { style: { font: '600 ' + Math.round(size * 0.32) + 'px/1 var(--font-mono)', color: 'var(--text-primary)' } }, value),
          h('span', { style: { font: '600 7px/1 var(--font-display)', letterSpacing: '0.2em', color: 'var(--text-muted)' } }, label || 'CR')
        )
      );
    }
    if (kind === 'bonus') {
      const c = RARE[accent] || RARE.gold;
      const hex = 'polygon(25% 0, 75% 0, 100% 50%, 75% 100%, 25% 100%, 0 50%)';
      return h('div', { style: Object.assign({ width: size * 1.08, height: size * 0.94, position: 'relative', filter: glow && !disabled ? 'drop-shadow(0 0 7px color-mix(in srgb, ' + c + ' 55%, transparent))' : 'none' }, dim, style) },
        h('div', { style: { position: 'absolute', inset: 0, clipPath: hex, background: c } }),
        h('div', { style: { position: 'absolute', inset: 2, clipPath: hex, background: 'linear-gradient(160deg, var(--bg-panel-raised), var(--bg-inset))', display: 'grid', placeItems: 'center' } },
          h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 } },
            h('span', { style: { font: '600 ' + Math.round(size * 0.3) + 'px/1 var(--font-mono)', color: c } }, '+' + value),
            h('span', { style: { font: '600 7px/1 var(--font-display)', letterSpacing: '0.2em', color: 'var(--text-muted)' } }, label || 'BNS')
          )
        )
      );
    }
    const m = 'var(--rare-magenta)';
    return h('div', { style: Object.assign({ width: size, height: size, display: 'grid', placeItems: 'center' }, dim, style) },
      h('div', { style: { width: size * 0.72, height: size * 0.72, transform: 'rotate(45deg)', boxSizing: 'border-box', border: '1px solid ' + m, background: 'var(--rare-magenta-glass)', boxShadow: disabled ? 'none' : 'var(--glow-magenta)', display: 'grid', placeItems: 'center', position: 'relative' } },
        h('div', { style: { position: 'absolute', inset: 4, border: '1px solid color-mix(in srgb, var(--rare-magenta) 40%, transparent)' } }),
        h('span', { style: { transform: 'rotate(-45deg)', font: '600 ' + Math.round(size * 0.34) + 'px/1 var(--font-display)', color: m, textShadow: disabled ? 'none' : '0 0 10px color-mix(in srgb, var(--rare-magenta) 70%, transparent)' } }, label || '\u5370')
      )
    );
  }

  function GlassPanel(props) {
    const { title = 'PANEL', status, active = false, width, style, children } = props;
    const dot = active ? 'var(--accent-ui)' : 'var(--text-muted)';
    return h('div', {
      style: Object.assign({
        position: 'relative', width, boxSizing: 'border-box',
        background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)', WebkitBackdropFilter: 'var(--glass-blur)',
        border: '1px solid ' + (active ? 'rgba(79,195,217,0.55)' : 'var(--glass-border-color)'),
        clipPath: 'var(--clip-panel)',
        boxShadow: active ? 'var(--glow-ui), var(--shadow-panel)' : 'var(--shadow-panel)',
        transition: 'box-shadow var(--dur) var(--ease-hud), border-color var(--dur) var(--ease-hud)',
      }, style),
    },
      h('div', { style: { position: 'absolute', inset: 0, background: 'var(--glass-highlight)', pointerEvents: 'none' } }),
      h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '10px 14px', borderBottom: '1px solid var(--border-subtle)' } },
        h('span', { style: { font: '600 11px/1 var(--font-display)', letterSpacing: '0.18em', textTransform: 'uppercase', color: active ? 'var(--accent-ui)' : 'var(--text-secondary)', textShadow: active ? 'var(--glow-text-ui)' : 'none' } }, title),
        h('span', { style: { display: 'inline-flex', alignItems: 'center', gap: 6 } },
          h('span', { style: { width: 6, height: 6, borderRadius: '50%', background: dot, boxShadow: active ? 'var(--glow-ui)' : 'none', animation: active ? 'ds-pulse 1.6s var(--ease-hud) infinite' : 'none' } }),
          h('span', { style: { font: '500 9px/1 var(--font-mono)', letterSpacing: '0.12em', color: active ? 'var(--accent-ui)' : 'var(--text-muted)' } }, status || (active ? 'ACTIVE' : 'IDLE'))
        )
      ),
      h('div', { style: { position: 'relative', padding: 'var(--pad-panel)' } }, children)
    );
  }

  const KINDS = {
    error: { c: 'var(--sys-error)', bg: 'var(--sys-error-glass)', border: 'var(--sys-error-border)', prefix: 'SYS.ERR' },
    success: { c: 'var(--sys-success)', bg: 'var(--sys-success-glass)', border: 'var(--sys-success-border)', prefix: 'SYS.OK' },
    info: { c: 'var(--accent-ui)', bg: 'var(--accent-ui-glass)', border: 'rgba(79,195,217,0.40)', prefix: 'SYS.MSG' },
  };

  function SystemBanner(props) {
    const { kind = 'error', code, children, onDismiss, style } = props;
    const k = KINDS[kind] || KINDS.error;
    return h('div', {
      style: Object.assign({
        display: 'flex', alignItems: 'center', gap: 12, padding: '9px 14px', boxSizing: 'border-box',
        background: k.bg, border: '1px solid ' + k.border,
        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', clipPath: 'var(--clip-btn)',
      }, style),
    },
      h('span', { style: { font: '600 10px/1 var(--font-mono)', letterSpacing: '0.08em', color: k.c, flexShrink: 0 } }, k.prefix + (code ? ' ' + code : '') + ' //'),
      h('span', { style: { font: '400 12px/1.4 var(--font-body)', color: 'var(--text-primary)', flex: 1 } }, children),
      onDismiss ? h('button', { onClick: onDismiss, style: { background: 'none', border: 'none', cursor: 'pointer', font: '500 11px/1 var(--font-mono)', color: 'var(--text-muted)', padding: 2 } }, '[x]') : null
    );
  }

  window.NightMarket = { Button, GameCard, TokenChip, GlassPanel, SystemBanner };
})();
