/** @type {import("tailwindcss").Config} */
module.exports = {
  content: {
    files: ["./index.html", "./assets/*.js"],
    transform: {
      js: (content) => content,
    },
  },
  theme: {
    extend: {
      fontFamily: {
        sans: [Open Sans, "sans-serif"],
      },
      colors: {
        brand: {
          teal: "#045E4C",
          cta: "#339966",
          dark: "#1a1a1a",
        },
      },
      animation: {
        scroll: "scroll 40s linear infinite",
      },
      keyframes: {
        scroll: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-100%)" },
        },
      },
    },
  },
  plugins: [],
};
