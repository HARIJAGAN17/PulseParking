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
        // Option A — Professional & Trustworthy (ParkPulse Official Palette)
        navy: {
          950: '#0E1F36',
          900: '#142D4E', // Deep Navy (Brand & Structural)
          800: '#1B3B66',
          700: '#23497D',
          600: '#2E5C9A',
        },
        teal: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          500: '#14B8A6',
          600: '#0D9488', // Teal (Primary Action & Selection)
          700: '#0F766E', // Dark Teal (Hover/Pressed)
          800: '#115E59',
          900: '#134E4A',
        },
        slate: {
          50: '#F8FAFC',  // Soft White (Application Background)
          100: '#F1F5F9', // Light Neutral Hover
          200: '#E2E8F0', // Light Slate (Card Borders & Dividers)
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B', // Muted Text / Helper Text
          600: '#475569',
          700: '#334155', // Secondary Text / Body Text
          800: '#1E293B',
          900: '#0F172A', // Primary Text / Dark Charcoal
        },
        // Mapped legacy tokens for seamless backward compatibility
        asphalt: {
          950: '#0E1F36',
          900: '#142D4E',
          800: '#1B3B66',
          700: '#334155',
          600: '#475569',
          500: '#64748B',
          400: '#94A3B8',
          300: '#CBD5E1',
          200: '#E2E8F0',
          100: '#F1F5F9',
        },
        concrete: {
          50: '#FFFFFF',
          100: '#F8FAFC',
          200: '#F1F5F9',
          300: '#E2E8F0',
          400: '#94A3B8',
        },
        // Functional Status Colors
        signal: {
          emerald: '#16A34A', // Green (Available / Success)
          amber: '#D97706',   // Amber (Reserved / Warning)
          rose: '#DC2626',    // Red (Occupied / Critical)
          orange: '#0D9488',  // Primary accent mapped to Teal
        },
        status: {
          available: '#16A34A',
          'available-bg': '#DCFCE7',
          'available-text': '#166534',
          occupied: '#DC2626',
          'occupied-bg': '#FEE2E2',
          'occupied-text': '#991B1B',
          reserved: '#D97706',
          'reserved-bg': '#FEF3C7',
          'reserved-text': '#92400E',
          unavailable: '#64748B',
          'unavailable-bg': '#E2E8F0',
          'unavailable-text': '#334155',
          selected: '#0D9488',
        }
      },
      boxShadow: {
        'tactile': '0 1px 2px 0 rgba(15, 23, 42, 0.05)',
        'tactile-pressed': 'inset 0 1px 2px rgba(15, 23, 42, 0.08)',
        'tactile-card': '0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.05)',
      }
    },
  },
  plugins: [],
}
