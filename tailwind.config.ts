import type { Config } from 'tailwindcss'

const withAlpha = (name: string) => `rgb(var(--${name}) / <alpha-value>)`

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg: withAlpha('bg'),
        surface: withAlpha('surface'),
        ink: withAlpha('ink'),
        muted: withAlpha('muted'),
        line: withAlpha('line'),
        accent: withAlpha('accent'),
        accent2: withAlpha('accent2'),
        ok: withAlpha('ok'),
        warn: withAlpha('warn'),
        bad: withAlpha('bad'),
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'var(--font-sans)', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        float: 'var(--shadow-float)',
        glow: '0 10px 40px -10px rgb(var(--accent) / 0.55)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        drift: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(6%, -4%) scale(1.08)' },
          '66%': { transform: 'translate(-5%, 5%) scale(0.95)' },
        },
        rise: {
          from: { opacity: '0', transform: 'translateY(14px) scale(0.98)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        spinSlow: { to: { transform: 'rotate(360deg)' } },
        pop: {
          from: { opacity: '0', transform: 'scale(0.6)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        float: 'float 7s ease-in-out infinite',
        drift: 'drift 22s ease-in-out infinite',
        rise: 'rise 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) both',
        'spin-slow': 'spinSlow 40s linear infinite',
        pop: 'pop 0.25s cubic-bezier(0.2, 0.8, 0.2, 1.2) both',
      },
    },
  },
  plugins: [],
}

export default config
