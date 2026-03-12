/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#064E3B',
          light:   '#0a7c5f',
          dark:    '#033729',
        },
        accent: {
          DEFAULT: '#F59E0B',
          dark:    '#D97706',
          light:   '#FCD34D',
        },
        brand: {
          bg:      '#FFFBEB',
          'bg-warm': '#FEF3C7',
          text:    '#1F2937',
          muted:   '#6B7280',
        },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        body:    ['"Jost"', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['clamp(3rem, 7vw, 7rem)', { lineHeight: '1.0', letterSpacing: '-0.02em' }],
        'display-lg': ['clamp(2.5rem, 5vw, 5rem)', { lineHeight: '1.1', letterSpacing: '-0.01em' }],
        'display-md': ['clamp(2rem, 4vw, 3.5rem)', { lineHeight: '1.15' }],
      },
      boxShadow: {
        brand: '0 4px 16px rgba(6,78,59,0.12)',
        gold:  '0 8px 32px rgba(245,158,11,0.3)',
      },
      animation: {
        'marquee': 'marquee 30s linear infinite',
        'fade-up': 'fadeUp 0.6s ease both',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
      container: {
        center: true,
        padding: { DEFAULT: '1rem', sm: '1.5rem', lg: '2rem' },
        screens: { xl: '1280px' },
      },
    },
  },
  plugins: [],
}