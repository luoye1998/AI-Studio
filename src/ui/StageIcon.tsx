import type { ReactElement } from 'react';
import type { StageId } from '../core/types';

const paths: Record<StageId, ReactElement> = {
  concept: (
    <>
      <circle cx="12" cy="12" r="7.5" />
      <circle cx="12" cy="12" r="2.6" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
    </>
  ),
  characters: (
    <>
      <rect x="3.5" y="4" width="17" height="16" rx="2.4" />
      <circle cx="9" cy="10" r="2.2" />
      <path d="M5.8 16.6c.6-2 1.8-3 3.2-3s2.6 1 3.2 3" />
      <path d="M15 9h3.2M15 12h3.2M15 15h2" />
    </>
  ),
  world: (
    <>
      <path d="M3 17.5h18" />
      <path d="M5 17.5V13l3-2 3 2v4.5" />
      <path d="M13 17.5V9.5l3-2 3 2v8" />
      <path d="M3 20.5h18" />
    </>
  ),
  outline: (
    <>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
      <path d="M3.5 9.5h17M9.5 9.5v10M15 9.5v10" />
    </>
  ),
  script: (
    <>
      <path d="M6 3.5h8.5L19 8v12.5H6z" />
      <path d="M14 3.5V8h5" />
      <path d="M9 12h7M9 15.5h7M9 19h4" />
    </>
  ),
  stress: (
    <>
      <path d="M3 12h3.5l2-5 3 10 2.5-7 1.8 4H21" />
      <circle cx="12" cy="12" r="9" opacity=".35" />
    </>
  ),
  lira: (
    <>
      <rect x="3.5" y="6" width="13" height="12" rx="1.8" />
      <rect x="7.5" y="3.5" width="13" height="12" rx="1.8" />
      <circle cx="12" cy="8.5" r="1.6" />
      <path d="M7.8 14.2l3-3 2.4 2.4 2-2 2.8 2.8" />
    </>
  ),
  acting: (
    <>
      <path d="M15.5 3.8c-3.6.6-6.2 3.4-6.2 7.2 0 4.2 3 7.2 6.2 7.2" />
      <path d="M9.3 9.6h2.2M9.3 13.4h2.2" />
      <path d="M15.7 15.6c1.6 1 2.8 2.6 3.3 4.6" />
    </>
  ),
  cinedance: (
    <>
      <path d="M3.5 8V4.5H7M17 4.5h3.5V8M20.5 16v3.5H17M7 19.5H3.5V16" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 4.5v3M12 16.5v3M4.5 12h3M16.5 12h3" />
    </>
  ),
};

export default function StageIcon({ id, size = 15 }: { id: StageId; size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {paths[id]}
    </svg>
  );
}
