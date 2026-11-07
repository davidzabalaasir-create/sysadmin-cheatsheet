/** Configuración de Tailwind. Tras cambiar clases en index.html o assets/app.js:
 *  npm run build:css   (genera assets/tailwind.css, que es lo que se publica) */
module.exports = {
  content: ["./index.html", "./assets/app.js"],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Instrument Serif"', "Georgia", "serif"],
        sans: ['"IBM Plex Sans"', "system-ui", "sans-serif"],
        mono: ['"IBM Plex Mono"', "ui-monospace", "Consolas", "monospace"]
      },
      colors: {
        paper: { DEFAULT: "#141310", 2: "#1b1a16", 3: "#23211c", line: "#2f2c25", line2: "#3d3930" },
        bone:  { DEFAULT: "#ece6d9", dim: "#a39d90", mute: "#8f897c" },
        amber: { DEFAULT: "#ffb454", soft: "#ffb45422" },
        sky:   { DEFAULT: "#8cc4ff", soft: "#8cc4ff22" },
        sage:  { DEFAULT: "#9fd8a6" },
        blood: { DEFAULT: "#ff6b5e", soft: "#ff6b5e1f" }
      }
    }
  }
};
