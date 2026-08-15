/**
 * @startingPoint section="Components" subtitle="Holographic glass HUD panel" viewport="700x240"
 */
export interface GlassPanelProps {
  /** Header label, ALL CAPS tracked */
  title?: string;
  /** Header status text (default 'ACTIVE' when active, else 'IDLE') */
  status?: string;
  /** Active-turn treatment: cyan border, glow, pulsing status dot */
  active?: boolean;
  width?: number | string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}
export declare function GlassPanel(props: GlassPanelProps): JSX.Element;
