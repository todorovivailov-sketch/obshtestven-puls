/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50:  '#f0f3f9',
          100: '#d9e1f0',
          200: '#b3c3e1',
          300: '#8da5d2',
          400: '#6787c3',
          500: '#4169b4',
          600: '#2d4f9b',
          700: '#1B2A4A',
          800: '#162240',
          900: '#101936',
        },
        crimson: {
          50:  '#fdf2f2',
          100: '#fce4e4',
          200: '#f9c9c9',
          300: '#f4a0a0',
          400: '#ec6a6a',
          500: '#e03e3e',
          600: '#C0392B',
          700: '#a32322',
          800: '#88201f',
          900: '#711f1f',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
