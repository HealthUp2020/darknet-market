Trading-card frame shared by all goods: cut top-right corner, header name strip, striped illustration well, category + value footer. Tier comes from `accent` — rare accents (cyan/gold/magenta) get full-strength border, inner hairline, 3 pips and permanent glow; common accents (purple/green/orange) get 55% border, 1 pip, no glow.

```jsx
<GameCard accent="magenta" name="Black ICE" value={9} selected />
<GameCard accent="green" name="Stim-packs" value={3} />
```

`selected` lifts the card and adds the cyan UI glow; `disabled` dims + desaturates. Drop real art into `illustration`.
