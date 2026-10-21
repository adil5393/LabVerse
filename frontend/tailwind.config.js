/** @type {import('tailwindcss').Config} */
import { experienceColors, colorVariables } from './experience-theme.js';

export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0c1017',
        surface: {
          DEFAULT: '#0f131b',
          dim: '#0f131b',
          bright: '#353942',
          lowest: '#0a0e16',
          low: '#181c24',
          container: '#1c2028',
          high: '#262a33',
          highest: '#31353e',
          card: '#161b24',
          elevated: '#1f2633',
          border: '#293140',
        },
        primary: {
          DEFAULT: '#4d8eff',
          light: '#adc6ff',
          dim: '#3b78e7',
          container: '#1e3a6e',
          fixed: '#d8e2ff',
          'fixed-dim': '#adc6ff',
          'on-container': '#d8e2ff',
        },
        secondary: {
          DEFAULT: '#ffb95a',
          container: '#c5831b',
          fixed: '#ffddb6',
        },
        tertiary: {
          DEFAULT: '#4edea3',
          container: '#00a572',
          fixed: '#6ffbbe',
        },
        error: {
          DEFAULT: '#ffb4ab',
          container: '#93000a',
          solid: '#ef4444',
        },
        outline: {
          DEFAULT: '#8c909f',
          variant: '#424754',
          subtle: '#222834',
        },
        'outline-variant': '#424754',
        'surface-container-lowest': '#0a0e16',
        'surface-container-low': '#181c24',
        'surface-container': '#1c2028',
        'surface-container-high': '#262a33',
        'surface-container-highest': '#31353e',
        'surface-variant': '#31353e',
        'on-surface': '#dfe2ee',
        'on-surface-variant': '#c2c6d6',
        ...colorVariables(experienceColors),
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        chalk: ['Caveat', 'cursive'],
      },
      spacing: {
        'space-xs': '0.25rem',
        'space-sm': '0.5rem',
        'space-md': '0.75rem',
        'space-lg': '1rem',
        'space-xl': '1.5rem',
      },
      boxShadow: {
        'led-glow-red': '0 0 24px 8px rgba(239, 68, 68, 0.8), 0 0 55px 24px rgba(239, 68, 68, 0.4)',
        'led-glow-green': '0 0 24px 8px rgba(16, 185, 129, 0.8), 0 0 55px 24px rgba(16, 185, 129, 0.4)',
        'led-glow-blue': '0 0 24px 8px rgba(59, 130, 246, 0.8), 0 0 55px 24px rgba(59, 130, 246, 0.4)',
        'led-glow-amber': '0 0 24px 8px rgba(245, 158, 11, 0.8), 0 0 55px 24px rgba(245, 158, 11, 0.4)',
        'active-socket': '0 0 8px #4edea3',
        'target-socket': '0 0 0 3px rgba(255, 185, 90, 0.4), 0 0 10px #ffb95a',
      },
    },
  },
  plugins: [],
};
