/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sage: {
          900: '#1a241a',
          800: '#2a382b',
          700: '#3B4D3C', // Primary Background
          600: '#546b55',
          500: '#758f76',
          400: '#9cb59d',
          300: '#bed1bf',
          200: '#D9E0D1', // Highlights
          100: '#edf2ec',
          50: '#f7fcf6',
        },
        beige: {
          900: '#948a7b',
          800: '#b0a697',
          700: '#c2b9a9',
          600: '#d9cdbd',
          500: '#E5E1DA', // Cards / secondary
          400: '#eeeadd',
          300: '#f5f1e8',
          200: '#faf8f2',
          100: '#F7F7F7', // Offwhite baseline
          50: '#fcfcfc',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
        mono: ['Space Mono', 'monospace'],
        opensans: ['Open Sans', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'soft-lg': '0 10px 30px -4px rgba(0, 0, 0, 0.08)',
      }
    },
  },
  plugins: [],
}

