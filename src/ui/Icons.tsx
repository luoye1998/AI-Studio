import type { ReactElement, SVGProps } from 'react';

export type IconName =
  | 'flow' | 'graph' | 'layers' | 'film' | 'wallet' | 'book' | 'settings' | 'spark'
  | 'plus' | 'check' | 'lock' | 'unlock' | 'play' | 'chevron' | 'chevronDown' | 'x'
  | 'search' | 'copy' | 'refresh' | 'download' | 'trash' | 'alert' | 'info' | 'clock'
  | 'user' | 'camera' | 'wand' | 'grid' | 'arrow' | 'dots' | 'eye' | 'bolt' | 'shield';

const paths: Record<IconName, ReactElement> = {
  flow: <><path d="M4 6h6M4 12h10M4 18h6" /><circle cx="17" cy="6" r="2.2" /><circle cx="18" cy="12" r="2.2" /><circle cx="14" cy="18" r="2.2" /></>,
  graph: <><rect x="3" y="4" width="7" height="6" rx="1.6" /><rect x="14" y="14" width="7" height="6" rx="1.6" /><path d="M10 7h4a2 2 0 0 1 2 2v5" /></>,
  layers: <><path d="m12 3 8 4.5-8 4.5-8-4.5L12 3Z" /><path d="m4 12 8 4.5 8-4.5" /><path d="m4 16.5 8 4.5 8-4.5" /></>,
  film: <><rect x="3" y="4" width="18" height="16" rx="2.4" /><path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4" /></>,
  wallet: <><path d="M3 8.5A2.5 2.5 0 0 1 5.5 6H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5.5A2.5 2.5 0 0 1 3 16.5v-8Z" /><path d="M3 9h13a2 2 0 0 1 0 4H3" /><circle cx="16.5" cy="11" r=".9" fill="currentColor" stroke="none" /></>,
  book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H19v15H6.5A2.5 2.5 0 0 0 4 20.5V5.5Z" /><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H19v3H6.5A2.5 2.5 0 0 1 4 20.5Z" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 1.56V21a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.56-1H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6 1.7 1.7 0 0 0 10 3.04V3a2 2 0 1 1 4 0v.09A1.7 1.7 0 0 0 15 4.6a1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9v.09a1.7 1.7 0 0 0 1.56 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1Z" /></>,
  spark: <><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  check: <path d="m4.5 12.5 5 5 10-11" />,
  lock: <><rect x="4.5" y="10.5" width="15" height="10" rx="2.2" /><path d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7" /></>,
  unlock: <><rect x="4.5" y="10.5" width="15" height="10" rx="2.2" /><path d="M8 10.5V7.8a4 4 0 0 1 7.4-2" /></>,
  play: <path d="M7 4.8v14.4L20 12 7 4.8Z" />,
  chevron: <path d="m9 5 7 7-7 7" />,
  chevronDown: <path d="m5 9 7 7 7-7" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  search: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></>,
  copy: <><rect x="8.5" y="8.5" width="11.5" height="11.5" rx="2" /><path d="M15.5 8.5V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7.5a2 2 0 0 0 2 2h2.5" /></>,
  refresh: <><path d="M20 12a8 8 0 1 1-2.6-5.9" /><path d="M20 4v4.5h-4.5" /></>,
  download: <><path d="M12 4v11" /><path d="m7 11 5 5 5-5" /><path d="M5 20h14" /></>,
  trash: <><path d="M4 7h16" /><path d="M9 7V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v2" /><path d="M6.5 7 7.5 20h9L17.5 7" /></>,
  alert: <><path d="M12 4.5 21 20H3L12 4.5Z" /><path d="M12 10v4.5" /><circle cx="12" cy="17.4" r=".8" fill="currentColor" stroke="none" /></>,
  info: <><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5.5" /><circle cx="12" cy="8.2" r=".8" fill="currentColor" stroke="none" /></>,
  clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3.2 2" /></>,
  user: <><circle cx="12" cy="8.5" r="3.6" /><path d="M4.8 20a7.4 7.4 0 0 1 14.4 0" /></>,
  camera: <><rect x="3" y="7" width="18" height="13" rx="2.4" /><circle cx="12" cy="13.5" r="3.6" /><path d="M8 7l1.3-2.2h5.4L16 7" /></>,
  wand: <><path d="M5 19 16 8" /><path d="M14.5 4.5 16 6.5M19.5 5.5 18 7.5M17 10.5l2-.5" /><path d="m13 7 4 4" /></>,
  grid: <><rect x="4" y="4" width="7" height="7" rx="1.4" /><rect x="13" y="4" width="7" height="7" rx="1.4" /><rect x="4" y="13" width="7" height="7" rx="1.4" /><rect x="13" y="13" width="7" height="7" rx="1.4" /></>,
  arrow: <path d="M4 12h15m0 0-5.5-5.5M19 12l-5.5 5.5" />,
  dots: <><circle cx="6" cy="12" r="1.4" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" /><circle cx="18" cy="12" r="1.4" fill="currentColor" stroke="none" /></>,
  eye: <><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="3" /></>,
  bolt: <path d="M13 2 5 13h5l-1 9 8-11h-5l1-9Z" />,
  shield: <><path d="M12 3 5 6v6c0 4.4 3 7.6 7 9 4-1.4 7-4.6 7-9V6l-7-3Z" /><path d="m9.2 12 2 2 3.6-4" /></>,
};

export function Icon({ name, ...props }: { name: IconName } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      {paths[name]}
    </svg>
  );
}

export function LogoMark() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.1} strokeLinecap="round">
      <path d="M4 7h5l3 10h5" />
      <path d="M15 4.5 19.5 7 15 9.5" />
    </svg>
  );
}
