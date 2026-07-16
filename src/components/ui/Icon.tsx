// Tiny inline-SVG icon set. Keeps the app dependency-free and the SVGs
// match the terminal aesthetic (stroke-based, no color fills from the icon
// itself — `currentColor` lets callers control the hue).
//
// Dark Reader (and similar browser extensions) inject inline styles +
// `data-darkreader-*` attributes on SVGs at runtime, which causes React
// to log "Extra attributes from the server" warnings. We mark every
// SVG as `suppressHydrationWarning` to silence the noise without
// swallowing genuine hydration bugs (props/className still reconcile).

import * as React from 'react';

type IconProps = React.SVGProps<SVGSVGElement> & { size?: number };

const base = (size: number): React.SVGAttributes<SVGSVGElement> => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: false,
  suppressHydrationWarning: true,
});

export const TerminalIcon = ({ size = 16, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="m4 17 6-6-6-6" />
    <path d="M12 19h8" />
  </svg>
);

export const BookIcon = ({ size = 16, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z" />
    <path d="M4 5.5V19.5" />
  </svg>
);

export const MonitorIcon = ({ size = 16, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <rect x="2" y="4" width="20" height="13" rx="2" />
    <path d="M8 21h8M12 17v4" />
  </svg>
);

export const TrophyIcon = ({ size = 16, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="M8 21h8M12 17v4" />
    <path d="M7 4h10v5a5 5 0 0 1-10 0V4z" />
    <path d="M17 5h3a2 2 0 0 1 2 2v1a4 4 0 0 1-4 4M7 5H4a2 2 0 0 0-2 2v1a4 4 0 0 0 4 4" />
  </svg>
);

export const CheckIcon = ({ size = 16, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export const ChevronRightIcon = ({ size = 16, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="m9 18 6-6-6-6" />
  </svg>
);

export const ChevronLeftIcon = ({ size = 16, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="m15 18-6-6 6-6" />
  </svg>
);

export const ArrowRightIcon = ({ size = 16, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="M5 12h14M13 5l7 7-7 7" />
  </svg>
);

export const BoltIcon = ({ size = 16, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="M13 2 3 14h8l-1 8 10-12h-8z" />
  </svg>
);

export const BrainIcon = ({ size = 16, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15A2.5 2.5 0 0 1 9.5 22 2.5 2.5 0 0 1 7 19.5a2.5 2.5 0 0 1-2.96-3.08 2.5 2.5 0 0 1-1.32-4.24 2.5 2.5 0 0 1 1.32-4.24A2.5 2.5 0 0 1 7 4.5 2.5 2.5 0 0 1 9.5 2z" />
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 2.5 2.5 2.5 2.5 0 0 0 2.5-2.5 2.5 2.5 0 0 0 2.96-3.08 2.5 2.5 0 0 0 1.32-4.24 2.5 2.5 0 0 0-1.32-4.24A2.5 2.5 0 0 0 17 4.5 2.5 2.5 0 0 0 14.5 2z" />
  </svg>
);

export const PlayIcon = ({ size = 16, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="M6 3l14 9-14 9z" />
  </svg>
);

export const CopyIcon = ({ size = 16, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

export const CheckCheckIcon = ({ size = 16, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="M2 12 7 17 18 6" />
    <path d="M22 6 12 16l-3-3" />
  </svg>
);

export const ResetIcon = ({ size = 16, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
    <path d="M3 3v5h5" />
  </svg>
);

export const GithubIcon = ({ size = 16, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

export const CloseIcon = ({ size = 16, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

export const MenuIcon = ({ size = 16, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="M3 6h18M3 12h18M3 18h18" />
  </svg>
);

export const SparklesIcon = ({ size = 16, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="m12 3-1.9 5.8L4 10.5l5.5 1.7L12 18l2.5-5.8 5.5-1.7-6.1-1.7z" />
    <path d="M5 3v4M3 5h4M19 17v4M17 19h4" />
  </svg>
);

export const HelpIcon = ({ size = 16, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <circle cx="12" cy="12" r="10" />
    <path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3" />
    <path d="M12 17h.01" />
  </svg>
);

export const SearchIcon = ({ size = 16, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

export const SunIcon = ({ size = 16, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </svg>
);

export const MoonIcon = ({ size = 16, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

export const KeyboardIcon = ({ size = 16, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M6 14h.01M18 14h.01M8 18h8" />
  </svg>
);

export const FireIcon = ({ size = 16, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="M12 2s4 4 4 8a4 4 0 0 1-8 0c0-1 .5-2 1-3-2 1-4 3-4 6a8 8 0 0 0 16 0c0-6-9-11-9-11z" />
  </svg>
);

export const LightbulbIcon = ({ size = 16, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.7.6 1 1.4 1 2.3v1h6v-1c0-.9.3-1.7 1-2.3A7 7 0 0 0 12 2z" />
  </svg>
);

export const TargetIcon = ({ size = 16, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

export const CommandIcon = ({ size = 16, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
  </svg>
);

export const StarIcon = ({ size = 16, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

export const ListIcon = ({ size = 16, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
  </svg>
);

export const FilterIcon = ({ size = 16, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="M3 6h18M6 12h12M10 18h4" />
  </svg>
);

export const BookmarkIcon = ({ size = 16, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);

export const NoteIcon = ({ size = 16, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6M8 13h8M8 17h6M10 9h2" />
  </svg>
);

export const AwardIcon = ({ size = 16, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <circle cx="12" cy="9" r="6" />
    <path d="M8.21 13.89 7 22l5-3 5 3-1.21-8.12" />
  </svg>
);

export const MedalIcon = ({ size = 16, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="M7.21 15 4 5h16l-3.21 10" />
    <path d="M7.21 15A5 5 0 1 0 12 20a5 5 0 1 0 4.79-5z" />
  </svg>
);

export const ClockIcon = ({ size = 16, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </svg>
);

export const ShareIcon = ({ size = 16, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <path d="M16 6 12 2 8 6" />
    <path d="M12 2v13" />
  </svg>
);

export const DownloadIcon = ({ size = 16, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <path d="M7 10l5 5 5-5" />
    <path d="M12 15V3" />
  </svg>
);

export const UploadIcon = ({ size = 16, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <path d="M17 8 12 3 7 8" />
    <path d="M12 3v12" />
  </svg>
);

export const UserIcon = ({ size = 16, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export const GamepadIcon = ({ size = 16, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <line x1="6" y1="11" x2="10" y2="11" />
    <line x1="8" y1="9" x2="8" y2="13" />
    <line x1="15" y1="12" x2="15.01" y2="12" />
    <line x1="17" y1="10" x2="17.01" y2="10" />
    <path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258A4 4 0 0 0 17.32 5z" />
  </svg>
);

export const PencilIcon = ({ size = 16, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z" />
  </svg>
);

export const TrashIcon = ({ size = 16, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="M3 6h18" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

export const SparkleStarIcon = ({ size = 16, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="M12 3v3M12 18v3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M3 12h3M18 12h3M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const CodeIcon = ({ size = 16, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="m16 18 6-6-6-6" />
    <path d="m8 6-6 6 6 6" />
  </svg>
);

export const ChartIcon = ({ size = 16, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="M3 3v18h18" />
    <path d="M7 14l3-3 4 4 5-6" />
  </svg>
);
