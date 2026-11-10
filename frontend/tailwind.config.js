/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"IBM Plex Mono"', 'monospace'],
      },
      colors: {
        asphalt: {
          950: '#0B0C0E',
          900: '#121417',
          800: '#1A1D23',
          700: '#262A33',
        },
        concrete: {
          50: '#FAFAF8',
          100: '#F4F3EF',
          200: '#EBEAE5',
          300: '#D8D6CE',
          400: '#B8B5AA',
        },
        signal: {
          emerald: '#059669',
          amber: '#D97706',
          rose: '#E11D48',
          orange: '#EA580C',
        }
      },
      boxShadow: {
        'tactile': '0 1px 0 rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
        'tactile-pressed': 'inset 0 1px 2px rgba(0,0,0,0.12)',
        'tactile-card': '0 1px 3px rgba(0,0,0,0.05), 0 10px 15px -5px rgba(0,0,0,0.03)',
      }
    },
  },
  plugins: [],
}

