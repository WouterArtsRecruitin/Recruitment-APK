/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // BraveBrand design tokens
        bg: {
          DEFAULT: '#05080c',
          card: 'rgba(17, 24, 34, 0.6)',
          up: 'rgba(12, 18, 28, 0.8)',
        },
        primary: {
          DEFAULT: '#09aedd',
          hover: '#0cc0f4',
        },
        amber: {
          brand: '#f5a009',
        },
        green: {
          brand: '#1db87a',
        },
        fg: '#f0f4f8',
        muted: '#94a3b8',
        border: {
          DEFAULT: 'rgba(30, 45, 64, 0.6)',
          hover: 'rgba(9, 174, 221, 0.4)',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
        heading: ['Outfit', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'glow-cyan': 'radial-gradient(ellipse 60% 50% at 70% 60%, rgba(9,174,221,.055) 0%, transparent 70%)',
        'glow-soft': 'radial-gradient(ellipse 40% 40% at 15% 30%, rgba(9,174,221,.04) 0%, transparent 60%)',
      },
      boxShadow: {
        'glow-cyan': '0 0 32px rgba(9,174,221,0.4)',
        'glow-sm': '0 0 16px rgba(9,174,221,0.2)',
        'card': '0 24px 50px rgba(0,0,0,0.6)',
      },
      borderRadius: {
        brand: '12px',
      },
    },
  },
  plugins: [],
}
