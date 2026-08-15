/**
 * @startingPoint section="Components" subtitle="Value circles, bonus hexes, the seal" viewport="700x170"
 */
export interface TokenChipProps {
  /** 'value' — circular machined chip, neutral. 'bonus' — hexagonal, accent rim, glows. 'seal' — unique rotated-square magenta seal (印). */
  kind?: 'value' | 'bonus' | 'seal';
  /** Number shown (value: plain, bonus: +N). Ignored by seal. */
  value?: number;
  /** Micro-label under the number (default 'CR' / 'BNS'); on seal, replaces the 印 glyph. */
  label?: string;
  /** Diameter / bounding size in px */
  size?: number;
  /** Bonus rim color: 'cyan' | 'gold' | 'magenta' (default gold) */
  accent?: 'cyan' | 'gold' | 'magenta';
  /** Bonus only: drop-shadow glow (default true) */
  glow?: boolean;
  disabled?: boolean;
  style?: React.CSSProperties;
}
export declare function TokenChip(props: TokenChipProps): JSX.Element;
