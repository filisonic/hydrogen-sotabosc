/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'bio-glow': '#00ff88',
        'bio-accent': '#00d4ff',
        'dark-bg': '#FFE500',
        'warm-gray': '#FFED4A',
        'cool-gray': '#FFF9C4',
        'yellow-dark': '#FFD700',
        'yellow-light': '#FFFACD',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
