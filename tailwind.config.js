/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50:  '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
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
