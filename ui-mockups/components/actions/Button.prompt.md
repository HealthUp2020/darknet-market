Action button in two voices: `gameplay` (angled sci-fi corners, cyan, glows on hover) for in-game moves, and `system` (square, monospace, bracketed, muted) for meta actions like reset — system actions must never compete visually with gameplay.

```jsx
<Button primary onClick={trade}>Execute trade</Button>
<Button onClick={take}>Take card</Button>
<Button variant="system">Reset match</Button>
```

Props: `variant` gameplay|system, `primary` (one per screen), `size` sm|md|lg, `disabled`.
