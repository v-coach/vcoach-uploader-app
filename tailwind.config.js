import plugin from 'tailwindcss/plugin';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    // Add this plugin to enable the 'fullscreen' variant
    plugin(function({ addVariant }) {
      addVariant('fullscreen', '&:fullscreen')
    })
  ],
}
