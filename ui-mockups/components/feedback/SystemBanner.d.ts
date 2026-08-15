/**
 * @startingPoint section="Components" subtitle="Error / success / info system banners" viewport="700x200"
 */
export interface SystemBannerProps {
  /** 'error' (red glass — also used for warnings), 'success', 'info' */
  kind?: 'error' | 'success' | 'info';
  /** Optional short code appended to the prefix, e.g. "402" → "SYS.ERR 402 //" */
  code?: string;
  children?: React.ReactNode;
  /** When provided, renders a [x] dismiss control */
  onDismiss?: () => void;
  style?: React.CSSProperties;
}
export declare function SystemBanner(props: SystemBannerProps): JSX.Element;
