/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Midnight Slate palette (replaces old islamic/green) ──
        // This intentional remapping means ALL existing islamic-* class
        // references automatically become the new midnight theme.
        islamic: {
          50:  '#f8fafc',  // Off-white / primary text
          100: '#e2e8f0',  // Text primary
          200: '#cbd5e1',  // Text
          300: '#94a3b8',  // Text muted
          400: '#64748b',  // Text secondary
          500: '#475569',  // Borders / dividers
          600: '#334155',  // Card border
          700: '#1e293b',  // Card bg (Rich Dark Slate)
          800: '#111827',  // Sidebar bg
          900: '#0d1117',  // Deep bg
          950: '#0b0f19',  // Canvas bg (Deep Midnight)
        },
        // ── Brushed Gold / Warm Amber ──
        gold: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',  // Warm Amber
          600: '#d4af37',  // Brushed Gold
          700: '#a8922a',
          800: '#8a7320',
          900: '#6e5c1a',
          950: '#3d3209',
        },
        // ── Garnet / Deep Red ──
        garnet: {
          50:  '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
          950: '#4c0519',
        },
        // ── Parchment (keep for NewTest ivory cards) ──
        parchment: {
          50:  '#fdf8f0',
          100: '#faefd9',
          200: '#f5ddb0',
          300: '#eec67f',
          400: '#e5a84d',
          500: '#dc8f2b',
          600: '#cd7620',
          700: '#aa5d1c',
          800: '#884a1d',
          900: '#6e3d1b',
        },
      },
      fontFamily: {
        sans:    ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        arabic:  ['Amiri', 'serif'],
        display: ['Playfair Display', 'serif'],
      },
      backgroundImage: {
        'islamic-pattern': "url('/islamic-pattern.svg')",
      },
      boxShadow: {
        // Legacy (kept so old references don't break)
        'glow-green':   '0 0 20px rgba(16, 185, 129, 0.3)',
        // New accent glows
        'glow-gold':    '0 0 20px rgba(212, 175, 55, 0.4)',
        'glow-indigo':  '0 0 20px rgba(99, 102, 241, 0.4)',
        'glow-blue':    '0 0 20px rgba(59, 130, 246, 0.4)',
        'glow-emerald': '0 0 20px rgba(16, 185, 129, 0.4)',
        'lux': '0 10px 25px -5px rgba(0,0,0,0.5), 0 8px 10px -6px rgba(0,0,0,0.5)',
      },
      animation: {
        'fade-in':        'fadeIn 0.4s ease-out',
        'slide-up':       'slideUp 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'pulse-glow':     'pulseGlow 2s ease-in-out infinite',
        'pulse-gold':     'pulseGold 2.5s ease-in-out infinite',
        'spin-slow':      'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%':   { opacity: '0', transform: 'translateX(16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(99,102,241,0.2)' },
          '50%':      { boxShadow: '0 0 30px rgba(99,102,241,0.5)' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 12px rgba(212,175,55,0.2)' },
          '50%':      { boxShadow: '0 0 28px rgba(212,175,55,0.55)' },
        },
      },
    },
  },
  plugins: [],
}
