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
        primary: {"50":"#eff6ff","100":"#dbeafe","200":"#bfdbfe","300":"#93c5fd","400":"#60a5fa","500":"#3b82f6","600":"#2563eb","700":"#1d4ed8","800":"#1e40af","900":"#1e3a8a","950":"#172554"}
      },
    },
  },
  plugins: [flowbite.plugin()],
};
