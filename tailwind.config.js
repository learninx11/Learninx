/** @type {import('tailwindcss').Config} */

// Design tokens live as CSS custom properties in `src/app/globals.css` (one
// palette per theme). Registering them here as `lx-*` colors lets utilities
// take an opacity modifier — `bg-lx-success/10`, `border-lx-accent/40` —
// which Tailwind cannot do for a bare `bg-[var(--lx-success)]/10`.
const token = (name) =>
  `color-mix(in srgb, var(--lx-${name}) calc(<alpha-value> * 100%), transparent)`;

const TOKENS = [
  'bg',
  'bg-elevated',
  'fg',
  'card',
  'card-hover',
  'surface',
  'surface-strong',
  'border',
  'border-strong',
  'accent',
  'accent-hover',
  'accent-contrast',
  'accent-2',
  'accent-glow',
  'success',
  'warning',
  'danger',
  'muted',
  'subtle',
  'code-bg',
  'prose-body',
  'prose-strong',
  'overlay',
  'difficulty-beginner',
  'difficulty-intermediate',
  'difficulty-advanced',
  'difficulty-expert',
];

module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        lx: Object.fromEntries(TOKENS.map((name) => [name, token(name)])),
        terminal: {
          bg: '#0b0f12',
          fg: '#d6deeb',
          accent: '#7fdbca',
          green: '#82aaff',
        },
      },
      fontFamily: {
        sans: [
          'var(--font-sans)',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
        mono: ['var(--font-mono)', '"JetBrains Mono"', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'lx-sm': 'var(--lx-shadow-sm)',
        'lx-lg': 'var(--lx-shadow-lg)',
      },
      keyframes: {
        'lx-fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'lx-pop-in': {
          from: { opacity: '0', transform: 'translateY(-6px) scale(0.98)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'lx-rise-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'lx-blink': {
          '0%, 49%': { opacity: '1' },
          '50%, 100%': { opacity: '0' },
        },
      },
      animation: {
        'lx-fade-in': 'lx-fade-in 150ms ease-out',
        'lx-pop-in': 'lx-pop-in 160ms cubic-bezier(0.16, 1, 0.3, 1)',
        'lx-rise-in': 'lx-rise-in 220ms cubic-bezier(0.16, 1, 0.3, 1)',
        'lx-blink': 'lx-blink 1.1s step-end infinite',
      },
    },
  },
  plugins: [],
};
