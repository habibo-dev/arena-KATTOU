import type { SVGProps } from 'react';

/**
 * Inline icon set — no icon library, so nothing extra ships to the patient.
 * All icons are 24×24, stroke-based, and inherit `currentColor`.
 */

const PATHS: Record<string, JSX.Element> = {
  tooth: (
    <path d="M12 4.5c-2.4-1.6-6-1.2-6.8 1.7-.7 2.5.4 3.9 1.2 6.4.6 2 1 4.6 1.8 6.9.4 1.2 2.1 1.2 2.5 0 .7-2.2 1-4.6 1.3-6.3 0 1.7.4 4.1 1 6.3.4 1.2 2.1 1.2 2.5 0 .8-2.3 1.2-4.9 1.8-6.9.8-2.5 1.9-3.9 1.2-6.4C18 3.3 14.4 2.9 12 4.5Z" />
  ),
  braces: (
    <>
      <path d="M3 10.5h18" />
      <path d="M6 8.5v4M10 8.5v4M14 8.5v4M18 8.5v4" />
      <path d="M4.5 15c1.2 2.5 4 4 7.5 4s6.3-1.5 7.5-4" />
      <path d="M12 5v3.5" />
    </>
  ),
  crown: (
    <>
      <path d="M5 17h14l1-8-4.5 3L12 6l-3.5 6L4 9l1 8Z" />
      <path d="M5 20h14" />
    </>
  ),
  extract: (
    <>
      <path d="M15 4.8c-2-1.2-4.7-.6-5.2 1.6-.4 1.8.9 2.7 1.6 4.4.6 1.5.6 3 .8 4.5" />
      <path d="M13.5 15.5 12 21" />
      <path d="m4.5 15.5 4-4" />
      <path d="m8.5 19.5 4-4" />
    </>
  ),
  xray: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M8 4v16M16 4v16M3 9h18M3 15h18" />
      <circle cx="12" cy="12" r="2.2" />
    </>
  ),
  sparkle: (
    <>
      <path d="M12 3.5 13.7 9l5.5 1.7-5.5 1.7L12 18l-1.7-5.6L4.8 10.7 10.3 9 12 3.5Z" />
      <path d="M18.5 16.5l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2Z" />
    </>
  ),
  scalpel: (
    <>
      <path d="M14.5 3.5 21 10l-2.5 2.5L12 6 14.5 3.5Z" />
      <path d="m12 6-8.5 8.5V21h6.5L18.5 12.5" />
    </>
  ),
  phone: (
    <path d="M6.6 3.5h3l1.5 4-2 1.4a12.5 12.5 0 0 0 6 6l1.4-2 4 1.5v3a2 2 0 0 1-2.2 2A16.8 16.8 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2Z" />
  ),
  whatsapp: (
    <>
      <path d="M3.5 20.5 5 16.4A8.2 8.2 0 1 1 8 19.3l-4.5 1.2Z" />
      <path d="M9 9.2c0 3 2.3 5.3 5.2 5.3.5 0 1.1-.4 1.1-1l-1.7-.9-.9.9a4.6 4.6 0 0 1-2.4-2.4l.9-.9-.9-1.7c-.7 0-1.3.6-1.3 1.7Z" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.6" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 1.8" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <path d="M3.5 9.5h17M8 3.5V6M16 3.5V6" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M4.8 20a7.2 7.2 0 0 1 14.4 0" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.3" />
      <path d="M3 19.5a6 6 0 0 1 12 0" />
      <path d="M16 5.2a3.3 3.3 0 0 1 0 6.1M17.5 14.4A6 6 0 0 1 21 19.5" />
    </>
  ),
  arrowLeft: <path d="M19 12H5m0 0 6-6m-6 6 6 6" />,
  arrowRight: <path d="M5 12h14m0 0-6-6m6 6-6 6" />,
  arrowDown: <path d="M12 5v14m0 0 6-6m-6 6-6-6" />,
  arrowUp: <path d="M12 19V5m0 0-6 6m6-6 6 6" />,
  check: <path d="m4.5 12.5 5 5 10-11" />,
  checkCircle: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m8.2 12.3 2.6 2.6 5-5.4" />
    </>
  ),
  x: <path d="m6 6 12 12M18 6 6 18" />,
  xCircle: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m9.2 9.2 5.6 5.6M14.8 9.2l-5.6 5.6" />
    </>
  ),
  alert: (
    <>
      <path d="M12 4.5 21 19.5H3L12 4.5Z" />
      <path d="M12 10v4M12 17h.01" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5M12 8h.01" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  chevronDown: <path d="m6 9.5 6 6 6-6" />,
  chevronLeft: <path d="m14.5 6-6 6 6 6" />,
  chevronRight: <path d="m9.5 6 6 6-6 6" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  globe: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.2 2.4 3.3 5.3 3.3 8.5S14.2 18.1 12 20.5c-2.2-2.4-3.3-5.3-3.3-8.5S9.8 5.9 12 3.5Z" />
    </>
  ),
  lock: (
    <>
      <rect x="4.5" y="10.5" width="15" height="10" rx="2" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </>
  ),
  logout: <path d="M14 5.5H6.5A1.5 1.5 0 0 0 5 7v10a1.5 1.5 0 0 0 1.5 1.5H14M17 8.5l3.5 3.5L17 15.5M20.5 12H10" />,
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 14.5a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1v.3a2 2 0 1 1-4 0v-.2a1.6 1.6 0 0 0-2.8-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1.1-2.7h-.3a2 2 0 1 1 0-4h.2a1.6 1.6 0 0 0 1.1-2.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 2.7-1.1v-.3a2 2 0 1 1 4 0v.2a1.6 1.6 0 0 0 2.8 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7h.3a2 2 0 1 1 0 4h-.2a1.6 1.6 0 0 0-1.4 1Z" />
    </>
  ),
  chart: (
    <>
      <path d="M4 20V4" />
      <path d="M4 20h16" />
      <path d="M8 16.5V11M12.5 16.5V7M17 16.5v-4" />
    </>
  ),
  bell: (
    <>
      <path d="M18 9a6 6 0 1 0-12 0c0 5-2 6.5-2 6.5h16S18 14 18 9Z" />
      <path d="M13.7 19a2 2 0 0 1-3.4 0" />
    </>
  ),
  qr: (
    <>
      <rect x="3.5" y="3.5" width="6.5" height="6.5" rx="1" />
      <rect x="14" y="3.5" width="6.5" height="6.5" rx="1" />
      <rect x="3.5" y="14" width="6.5" height="6.5" rx="1" />
      <path d="M14 14h3v3h-3zM20.5 14v3M17 20.5h3.5M14 20.5h.01" />
    </>
  ),
  play: <path d="M7 4.5 19 12 7 19.5v-15Z" />,
  skip: <path d="M6 5.5 15 12l-9 6.5v-13ZM18 5.5v13" />,
  flag: <path d="M5 21V4.5h13l-2.5 4L18 12H5" />,
  timer: (
    <>
      <circle cx="12" cy="13.5" r="7" />
      <path d="M12 10v3.5l2.5 1.5M9.5 3h5" />
    </>
  ),
  edit: <path d="M4.5 19.5h4L19 9a2.5 2.5 0 0 0-3.5-3.5L5 16v3.5ZM14.5 6.5 18 10" />,
  trash: <path d="M4.5 7h15M9 7V4.5h6V7M6.5 7l1 13h9l1-13M10.5 11v5.5M13.5 11v5.5" />,
  download: <path d="M12 4v11m0 0 4.5-4.5M12 15l-4.5-4.5M4.5 19.5h15" />,
  shield: <path d="M12 3.5 5 6v6c0 4.5 3 7.6 7 9 4-1.4 7-4.5 7-9V6l-7-2.5Z" />,
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </>
  ),
  copy: (
    <>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M15 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h3" />
    </>
  ),
  printer: (
    <>
      <path d="M7 9V4.5h10V9" />
      <rect x="3.5" y="9" width="17" height="7.5" rx="2" />
      <path d="M7 14h10v6H7z" />
    </>
  ),
  external: <path d="M14 4.5h5.5V10M19 5l-8 8M18 14v4.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10" />,
  refresh: <path d="M20 12a8 8 0 1 1-2.6-5.9M20 4v4.5h-4.5" />,
  list: <path d="M8 6.5h12M8 12h12M8 17.5h12M4 6.5h.01M4 12h.01M4 17.5h.01" />,
  activity: <path d="M3.5 12h4l2.5-7 4 14 2.5-7h4" />,
  mail: (
    <>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </>
  ),
  stethoscope: (
    <>
      <path d="M6 4v5a4 4 0 0 0 8 0V4" />
      <path d="M4.5 4H6M13.5 4H12M10 13v2.5a4.5 4.5 0 0 0 9 0V14" />
      <circle cx="19" cy="12" r="2" />
    </>
  ),
  ticket: (
    <>
      <path d="M4 8.5V6.5h16v2a2.5 2.5 0 0 0 0 5v2H4v-2a2.5 2.5 0 0 0 0-5Z" />
      <path d="M12 7v10" strokeDasharray="2 2" />
    </>
  ),
  dots: (
    <>
      <circle cx="12" cy="5.5" r="1.4" />
      <circle cx="12" cy="12" r="1.4" />
      <circle cx="12" cy="18.5" r="1.4" />
    </>
  ),
  building: (
    <>
      <path d="M4 20.5V5.5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v15" />
      <path d="M13 10.5h6a1 1 0 0 1 1 1v9" />
      <path d="M3 20.5h18M7 8h3M7 12h3M7 16h3M16 14h1M16 17.5h1" />
    </>
  ),
  hourglass: (
    <>
      <path d="M7 3.5h10M7 20.5h10" />
      <path d="M7 3.5v3.2c0 2 5 3.3 5 5.3s-5 3.3-5 5.3v3.2M17 3.5v3.2c0 2-5 3.3-5 5.3s5 3.3 5 5.3v3.2" />
    </>
  ),
};

export type IconName = keyof typeof PATHS;

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName;
  size?: number;
  /** Stroke width; 1.6 keeps icons light and clinical. */
  strokeWidth?: number;
  filled?: boolean;
}

export function Icon({
  name,
  size = 20,
  strokeWidth = 1.6,
  filled = false,
  className,
  ...rest
}: IconProps) {
  const glyph = PATHS[name];
  if (!glyph) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke={filled ? 'none' : 'currentColor'}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...rest}
    >
      {glyph}
    </svg>
  );
}

/** Clinic wordmark — used in the header and as the portrait placeholder. */
export function Wordmark({
  className,
  tone = 'navy',
}: {
  className?: string;
  tone?: 'navy' | 'light';
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ''}`}>
      <span
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-[9px] ${
          tone === 'navy' ? 'bg-navy-800 text-shell-50' : 'bg-shell-50/10 text-shell-50 ring-1 ring-shell-50/20'
        }`}
      >
        <Icon name="tooth" size={19} strokeWidth={1.5} />
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={`text-[0.94rem] font-semibold tracking-tightish ${
            tone === 'navy' ? 'text-navy-900' : 'text-shell-50'
          }`}
        >
          DR M. KATTOU
        </span>
        <span
          className={`mt-1 text-[0.68rem] font-medium uppercase tracking-[0.14em] ${
            tone === 'navy' ? 'text-stone-500' : 'text-shell-200/70'
          }`}
        >
          Chirurgien Dentiste
        </span>
      </span>
    </span>
  );
}
