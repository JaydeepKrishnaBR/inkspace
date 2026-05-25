/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        serif: ['Lora', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        ink: {
          50:  '#f5f3ef',
          100: '#ebe7df',
          200: '#d6ccbf',
          300: '#bfaf9d',
          400: '#a6917a',
          500: '#8c7660',
          600: '#705e4d',
          700: '#57493d',
          800: '#3d342c',
          900: '#261f1a',
          950: '#130f0d',
        },
        paper: {
          light: '#faf8f4',
          sepia: '#f5edd9',
          dark:  '#1a1714',
        },
        accent: {
          yellow: '#f5c842',
          green:  '#6abf7b',
          blue:   '#5b9bd5',
          pink:   '#e07db3',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.25s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        slideInLeft: { from: { opacity: 0, transform: 'translateX(-12px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
        slideInRight: { from: { opacity: 0, transform: 'translateX(12px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
      },
    },
  },
  plugins: [],
}
