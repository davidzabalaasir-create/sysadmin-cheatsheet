/** Configuración de Tailwind. Tras cambiar clases en index.html o assets/app.js:
 *  npm run build:css   (genera assets/tailwind.css, que es lo que se publica) */
const v = (name) => `rgb(var(--c-${name}) / <alpha-value>)`;

module.exports = {
  content: ["./index.html", "./assets/app.js"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"IBM Plex Sans"', "system-ui", "sans-serif"],
        mono: ['"IBM Plex Mono"', "ui-monospace", "Consolas", "monospace"]
      },
      // Los colores salen de variables CSS (assets/styles.css) para tener tema claro y oscuro.
      // paper = fondos, bone = texto, accent = color de marca, warn = precaución / Linux,
      // sky = Windows y parámetros, sage = seguro / red, blood = peligro, code = bloques de código.
      colors: {
        paper: { DEFAULT: v("paper"), 2: v("paper-2"), 3: v("paper-3"), line: v("line"), line2: v("line-2") },
        bone:  { DEFAULT: v("bone"), dim: v("bone-dim"), mute: v("bone-mute") },
        accent: { DEFAULT: v("accent"), soft: "rgb(var(--c-accent) / 0.13)" },
        warn:  { DEFAULT: v("warn"), soft: "rgb(var(--c-warn) / 0.13)" },
        sky:   { DEFAULT: v("sky"), soft: "rgb(var(--c-sky) / 0.13)" },
        sage:  { DEFAULT: v("sage") },
        blood: { DEFAULT: v("blood"), soft: "rgb(var(--c-blood) / 0.12)" },
        code:  { DEFAULT: v("code") }
      }
    }
  }
};
