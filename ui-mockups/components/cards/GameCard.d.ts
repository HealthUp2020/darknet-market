/**
 * @startingPoint section="Components" subtitle="Trading card frame — rare & common tiers" viewport="700x270"
 */
export interface GameCardProps {
  /** Rare tier (glowing): 'cyan' | 'gold' | 'magenta'. Common tier (matte): 'purple' | 'green' | 'orange'. Tier is derived from accent. */
  accent?: 'cyan' | 'gold' | 'magenta' | 'purple' | 'green' | 'orange';
  /** Card name, rendered ALL CAPS in the header strip */
  name?: string;
  /** Category line above the value, e.g. "Common // Trade good". Defaults per tier. */
  type?: string;
  /** Trade value, monospace, accent-colored */
  value?: number;
  /** Replaces the striped placeholder in the illustration well */
  illustration?: React.ReactNode;
  selected?: boolean;
  disabled?: boolean;
  /** Card width in px; height = width × 1.4 */
  width?: number;
  onClick?: () => void;
  style?: React.CSSProperties;
}
export declare function GameCard(props: GameCardProps): JSX.Element;
