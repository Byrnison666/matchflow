const { hairlineWidth } = require('nativewind/theme')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#08080A',
        secondary: '#101014',
        card: '#17171D',
        'accent-from': '#FF4B6E',
        'accent-to': '#FF8C42',
        'accent-muted': 'rgba(255,75,110,0.15)',
        'glass-border': 'rgba(255,255,255,0.08)',
        success: '#00C853',
        error: '#FF4444',
        neutral: {
          700: '#1A1A1A',
          600: '#242424',
          500: '#3A3A3A',
          400: '#6B6B6B',
          300: '#9B9B9B',
        },
      },
      borderWidth: { hairline: hairlineWidth() },
    },
  },
}
