import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#08080A',
        secondary: '#101014',
        card: '#17171D',
        accent: {
          from: '#FF4B6E',
          to: '#FF8C42',
          hover: '#FF3560',
          muted: 'rgba(255,75,110,0.15)',
        },
        neutral: {
          900: '#0D0D0D',
          800: '#141414',
          700: '#1A1A1A',
          600: '#242424',
          500: '#3A3A3A',
          400: '#6B6B6B',
          300: '#9B9B9B',
          100: '#F5F5F5',
        },
        success: '#00C853',
        warning: '#FFB300',
        error: '#FF4444',
        online: '#00E676',
        glass: {
          bg: 'rgba(255,255,255,0.04)',
          border: 'rgba(255,255,255,0.08)',
        },
      },
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
      },
      borderRadius: {
        card: '20px',
        xl: '24px',
        '2xl': '32px',
      },
      boxShadow: {
        card: '0 4px 24px rgba(0,0,0,0.4)',
        glow: '0 0 44px rgba(255,75,110,0.34)',
        glass: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)',
        modal: '0 24px 64px rgba(0,0,0,0.6)',
        premium: '0 24px 80px rgba(255,75,110,0.18), 0 10px 36px rgba(0,0,0,0.5)',
      },
      backgroundImage: {
        'coral-gradient': 'linear-gradient(135deg, #FF4B6E 0%, #FF8C42 100%)',
        'coral-gradient-r': 'linear-gradient(225deg, #FF4B6E 0%, #FF8C42 100%)',
        'card-overlay': 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 40%, transparent 70%)',
        'aurora-panel': 'linear-gradient(145deg, rgba(255,255,255,0.12), rgba(255,255,255,0.035))',
        'chat-gradient': 'linear-gradient(135deg, #FF4B6E 0%, #FF8C42 52%, #FFB36B 100%)',
      },
      keyframes: {
        meshFloat: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0) scale(1)' },
          '50%': { transform: 'translate3d(18px, -16px, 0) scale(1.08)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '180% 0' },
          '100%': { backgroundPosition: '-80% 0' },
        },
        'flame-flicker': {
          '0%, 100%': { transform: 'scale(1) rotate(-2deg)', opacity: '0.9' },
          '50%': { transform: 'scale(1.1) rotate(3deg)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'pulse-online': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.4)', opacity: '0.6' },
        },
      },
      animation: {
        meshFloat: 'meshFloat 10s ease-in-out infinite',
        shimmer: 'shimmer 4s ease-in-out infinite',
        'flame-flicker': 'flame-flicker 1.6s ease-in-out infinite',
        slideUp: 'slideUp 0.3s ease-out',
        'pulse-online': 'pulse-online 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

export default config
