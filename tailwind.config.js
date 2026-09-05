/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Warm off-white surfaces — never pure white.
        shell: {
          DEFAULT: '#F7F5F1',
          50: '#FBFAF8',
          100: '#F7F5F1',
          200: '#F0EDE7',
          300: '#E6E2DA',
          400: '#D8D3C9',
        },
        // Deep navy — primary brand ink.
        navy: {
          DEFAULT: '#10293C',
          50: '#EEF3F6',
          100: '#D8E3EA',
          200: '#AFC5D3',
          300: '#7E9CB1',
          400: '#4F728C',
          500: '#2E536E',
          600: '#1C3C55',
          700: '#143149',
          800: '#10293C',
          900: '#0B1D2B',
        },
        // Muted medical green — clinical, calm, trustworthy.
        sage: {
          DEFAULT: '#3E7C69',
          50: '#EDF5F2',
          100: '#D6E9E2',
          200: '#AED3C7',
          300: '#7FB7A5',
          400: '#549785',
          500: '#3E7C69',
          600: '#2F6354',
          700: '#264F43',
          800: '#1E3D35',
          900: '#172E28',
        },
        // Very subtle warm accent — used sparingly for emphasis.
        clay: {
          DEFAULT: '#B08242',
          50: '#FAF4EA',
          100: '#F2E5CE',
          200: '#E2CB9C',
          300: '#CDA96A',
          400: '#BE9452',
          500: '#B08242',
          600: '#8F6933',
          700: '#6E5127',
          800: '#4E391C',
        },
        // Neutral warm grays for text and borders.
        stone: {
          50: '#FAFAF9',
          100: '#F4F3F1',
          200: '#E7E5E1',
          300: '#D3D0CA',
          400: '#A8A49C',
          500: '#7E7A73',
          600: '#5E5B55',
          700: '#454340',
          800: '#2E2C2A',
          900: '#1B1A19',
        },
        // Semantic status colours.
        state: {
          info: '#2E536E',
          success: '#3E7C69',
          warn: '#B08242',
          danger: '#A8433C',
          neutral: '#7E7A73',
        },
      },
      fontFamily: {
        sans: [
          '"IBM Plex Sans Arabic"',
          '"IBM Plex Sans"',
          'system-ui',
          '-apple-system',
          '"Segoe UI"',
          'sans-serif',
        ],
        display: ['"IBM Plex Sans Arabic"', '"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        // Fluid scale tuned for Arabic legibility on small screens.
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
      letterSpacing: {
        tightish: '-0.01em',
      },
      boxShadow: {
        card: '0 1px 2px rgba(16, 41, 60, 0.05), 0 8px 24px -12px rgba(16, 41, 60, 0.14)',
        lift: '0 2px 6px rgba(16, 41, 60, 0.06), 0 18px 40px -20px rgba(16, 41, 60, 0.28)',
        inset: 'inset 0 1px 0 rgba(255,255,255,0.6)',
        ring: '0 0 0 3px rgba(62, 124, 105, 0.18)',
      },
      borderRadius: {
        // Deliberately restrained radii — no pill-everything look.
        sm: '4px',
        DEFAULT: '6px',
        md: '8px',
        lg: '10px',
        xl: '14px',
        '2xl': '18px',
      },
      spacing: {
        '18': '4.5rem',
        'safe-b': 'env(safe-area-inset-bottom, 0px)',
      },
      maxWidth: {
        content: '72rem',
        measure: '62ch',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.45' },
        },
        'slide-in': {
          from: { opacity: '0', transform: 'translateY(-10px) scale(0.98)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.4s cubic-bezier(0.22,0.61,0.36,1) both',
        'fade-in': 'fade-in 0.3s ease-out both',
        'pulse-soft': 'pulse-soft 2.4s ease-in-out infinite',
        'slide-in': 'slide-in 0.22s cubic-bezier(0.22,0.61,0.36,1) both',
      },
    },
  },
  plugins: [],
};
