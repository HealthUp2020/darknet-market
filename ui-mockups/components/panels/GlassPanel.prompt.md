Holographic glass panel for player/bot stat blocks and the terminal log: blurred dark glass, cut top-left/bottom-right corners, hairline cyan border, header with tracked-caps title + status dot. `active` marks whose turn it is — cyan border, UI glow, pulsing dot.

```jsx
<GlassPanel title="Operator // You" active>
  …stats…
</GlassPanel>
<GlassPanel title="VULT-3R" status="THINKING">…</GlassPanel>
```

Only ONE panel should be `active` at a time — it is the turn signal.
