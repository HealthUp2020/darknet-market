/**
 * @startingPoint section="Components" subtitle="Gameplay & system action buttons" viewport="700x230"
 */
export interface ButtonProps {
  /** 'gameplay' — angled corners, cyan, Chakra Petch. 'system' — square, mono, muted (reset, settings, meta actions). */
  variant?: 'gameplay' | 'system';
  /** Filled cyan emphasis. Reserve for the single most important action on screen. */
  primary?: boolean;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function Button(props: ButtonProps): JSX.Element;
