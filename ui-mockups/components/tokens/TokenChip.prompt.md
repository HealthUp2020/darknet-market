One component, three visually distinct token families: `value` (circle — neutral machined chip with mono number, no glow), `bonus` (hexagon — accent-colored rim, gold by default, subtle glow), `seal` (rotated-square diamond, magenta, kanji 印, full glow — the one-of-a-kind special token).

```jsx
<TokenChip kind="value" value={7} />
<TokenChip kind="bonus" value={3} accent="gold" />
<TokenChip kind="seal" />
```

Shape alone must distinguish families at a glance: circle = currency, hex = reward, diamond = unique.
