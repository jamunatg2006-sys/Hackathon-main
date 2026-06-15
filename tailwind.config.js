/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cyber: {
          black: '#050306',
          navy: '#13060a',
          panel: '#1b0a10',
          light: '#5b1d2a',
          green: '#00ff88',
          'green-dim': '#00cc6a',
          red: '#ff1744',
          'red-bright': '#ff3b5f',
          orange: '#ff6b35',
          yellow: '#eab308',
          cyan: '#18d7ff',
          blue: '#7c3aed',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 24px rgba(255, 23, 68, 0.42)',
        'glow-red': '0 0 28px rgba(255, 23, 68, 0.55)',
        'glow-orange': '0 0 20px rgba(249, 115, 22, 0.3)',
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        scan: 'scan 2s linear infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        float: 'float 18s linear infinite',
        pop: 'pop 4s ease-in-out infinite',
        'boot-fade': 'boot-fade 4s ease-in-out forwards',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 23, 68, 0.35)' },
          '50%': { boxShadow: '0 0 48px rgba(255, 23, 68, 0.75)' },
        },
        float: {
          '0%': { transform: 'translateY(20vh) scale(0.75)', opacity: '0' },
          '10%': { opacity: '0.85' },
          '70%': { opacity: '0.75' },
          '100%': { transform: 'translateY(-120vh) scale(1.45)', opacity: '0' },
        },
        pop: {
          '0%, 100%': { transform: 'scale(0.72)', opacity: '0.18' },
          '45%': { transform: 'scale(1.12)', opacity: '0.75' },
          '60%': { transform: 'scale(1.35)', opacity: '0' },
        },
        'boot-fade': {
          '0%, 82%': { opacity: '1' },
          '100%': { opacity: '0', visibility: 'hidden' },
        },
      },
    },
  },
  plugins: [],
};
