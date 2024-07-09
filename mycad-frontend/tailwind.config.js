const flowbite = require('flowbite-react/tailwind');

/** @type {import('tailwindcss').Config} \*/
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}', flowbite.content()],
  theme: {
    extend: {
      colors: {
        'mycad-sand': '#F6E8DF',
        'mycad-salmon': '#FEAE96',
        'mycad-rose': '#FE979C',
        'mycad-rose-dark': '#F26A7E',
        'mycad-purp': '#013237',
        'mycad-purp-light': '#0B2948',
      },
    },
  },
  plugins: [flowbite.plugin()],
};
