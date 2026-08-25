/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'olive': {
          50: '#f7f9f2',
          100: '#ecf3e1',
          200: '#d7e6c4',
          300: '#b8d298',
          400: '#95b76a',
          500: '#779b4b',
          600: '#5c7c38',
          700: '#48612f',
          800: '#3b4e2a',
          900: '#334225',
          950: '#1a2411'
        },
        'earth': {
          50: '#faf8f5',
          100: '#f2ede4',
          200: '#e4d9c7',
          300: '#d2bea0',
          400: '#bd9f77',
          500: '#ad8a5c',
          600: '#a07850',
          700: '#866143',
          800: '#6c4f3a',
          900: '#584232',
          950: '#2f2219'
        },
        'cream': {
          50: '#fefdf9',
          100: '#fcf9f0',
          200: '#f8f1de',
          300: '#f1e4c2',
          400: '#e7d09b',
          500: '#ddbb76'
        },
        'navy': {
          50: '#f2f5fa',
          100: '#e1e9f3',
          200: '#c6d5e8',
          300: '#9cb6d6',
          400: '#6b8ebf',
          500: '#4a6fa5',
          600: '#3a5788',
          700: '#30466e',
          800: '#2a3c5b',
          900: '#26334c',
          950: '#151c2e'
        },
        'warm-white': '#fdfbf7'
      },
      fontFamily: {
        'display': ['"Playfair Display"', 'Georgia', 'serif'],
        'brand': ['Manrope', 'system-ui', 'sans-serif'],
        'sans': ['Inter', 'system-ui', 'sans-serif']
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
        'fade-in-down': 'fadeInDown 0.8s ease-out forwards',
        'fade-in-left': 'fadeInLeft 0.8s ease-out forwards',
        'fade-in-right': 'fadeInRight 0.8s ease-out forwards',
        'zoom-in-slow': 'zoomInSlow 20s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        fadeInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-40px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' }
        },
        fadeInRight: {
          '0%': { opacity: '0', transform: 'translateX(40px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' }
        },
        zoomInSlow: {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.1)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' }
        }
      }
    }
  },
  plugins: []
}
