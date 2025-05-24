const flowbite = require('flowbite-react/tailwind');

/** @type {import('tailwindcss').Config} \*/
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}', flowbite.content()],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
      },

      colors: {
        'sinabe-danger': '#EF476F',
        'sinabe-warning': '#FFD166',
        'sinabe-success': '#06D6A0',
        'sinabe-info': '#118AB2',
        'sinabe-primary': '#7e3af2',
        'sinabe-secondary': '#D9376E',
        'sinabe-dark': '#0D0D0D',
        'sinabe-light': '#FFFFFE',
        'sinabe-gray': '#e7e5e4',
        'sinabe-blue-dark': '#073B4C',
        'sinabe-gray-dark': '#44403c',
        'sinabe-green': '#0e9f6e',
      },
      animation: {
        shake: 'shake 0.82s cubic-bezier(.36,.07,.19,.97) both',
      },
      keyframes: {
        shake: {
          '10%, 90%': {
            transform: 'translate3d(-1px, 0, 0)',
          },
          '20%, 80%': {
            transform: 'translate3d(2px, 0, 0)',
          },
          '30%, 50%, 70%': {
            transform: 'translate3d(-4px, 0, 0)',
          },
          '40%, 60%': {
            transform: 'translate3d(4px, 0, 0)',
          },
        },
      },
    },
  },
  plugins: [flowbite.plugin()],
};
