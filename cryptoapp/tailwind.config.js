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
    },
  },
  plugins: [
    flowbite.plugin(),
  ],
}

