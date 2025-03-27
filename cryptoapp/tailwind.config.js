const flowbite = require("flowbite-react/tailwind");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    flowbite.content(),
  ],
  theme: {
    extend: {
      colors: {
        default: "#FF0000",
        second: "#00FF00",
        third: "#0000FF", 
        buttonColor: "#261FB3",
      },
      backgroundImage: {
        'custom-radial': 'radial-gradient(84.15% 100% at 0 0, #23469d 0, #142b72 23.58%, #0a1549 54.58%, #020a30 79.56%, #010118 100%)',
      },

    },
  },
  plugins: [
    flowbite.plugin(),
  ],
}

