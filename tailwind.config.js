/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Vintage Barbershop Palette ────────────────────────
        navy: {
          DEFAULT: "#1B3A5C",
          50:  "#F2F6FA",
          100: "#E1E9F1",
          200: "#C3D3E2",
          300: "#9BB4CC",
          400: "#6E8FAD",
          500: "#47708F",
          600: "#2E567A",
          700: "#1B3A5C",
          800: "#142C46",
          900: "#0D1E31",
        },
        red: {
          DEFAULT: "#E3474F",
          50:  "#FEF1F1",
          100: "#FDDCDC",
          200: "#FBBABA",
          300: "#F69395",
          400: "#EF6A6E",
          500: "#E3474F",
          600: "#C93A42",
          700: "#A82E35",
          800: "#85252B",
          900: "#611B20",
        },
        cream: {
          DEFAULT: "#EDE7DA",
          50:  "#FBF9F4",
          100: "#F4F1E9",
          200: "#EDE7DA",
          300: "#E0D8C5",
          400: "#CFC5AC",
          500: "#B8AD92",
          600: "#9A8F75",
          700: "#7B7159",
          800: "#57503F",
          900: "#312D24",
        },
        paper: {
          DEFAULT: "#FFFFFF",
          warm:   "#F4F1E9",
        },
        slate: {
          DEFAULT: "#5B6472",
          50:  "#F5F6F8",
          100: "#E9EBEE",
          200: "#D2D6DC",
          300: "#B3B9C1",
          400: "#8A93A0",
          500: "#5B6472",
          600: "#4A525E",
          700: "#3A414B",
          800: "#2A2F37",
          900: "#1A1E24",
        },
        // ── Legacy aliases (map old names onto the barbershop palette) ──
        espresso: {
          DEFAULT: "#1B3A5C",
          50:  "#F2F6FA",
          100: "#E1E9F1",
          200: "#C3D3E2",
          300: "#9BB4CC",
          400: "#6E8FAD",
          500: "#47708F",
          600: "#2E567A",
          700: "#1B3A5C",
          800: "#142C46",
          900: "#0D1E31",
        },
        parchment: {
          DEFAULT: "#EDE7DA",
          50:  "#FBF9F4",
          100: "#F4F1E9",
          200: "#EDE7DA",
          300: "#E0D8C5",
          400: "#CFC5AC",
          500: "#B8AD92",
          600: "#9A8F75",
          700: "#7B7159",
          800: "#57503F",
          900: "#312D24",
        },
        brass: {
          DEFAULT: "#E3474F",
          50:  "#FEF1F1",
          100: "#FDDCDC",
          200: "#FBBABA",
          300: "#F69395",
          400: "#EF6A6E",
          500: "#E3474F",
          600: "#C93A42",
          700: "#A82E35",
          800: "#85252B",
          900: "#611B20",
        },
        // ── Semantic tokens ──────────────────────────────────
        border:     "#1B3A5C",
        input:      "#1B3A5C",
        ring:       "#E3474F",
        background: "#EDE7DA",
        foreground: "#1B3A5C",
        primary: {
          DEFAULT:    "#E3474F",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT:    "#1B3A5C",
          foreground: "#F4F1E9",
        },
        destructive: {
          DEFAULT:    "#B93A41",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT:    "#E7E1D2",
          foreground: "#5B6472",
        },
        accent: {
          DEFAULT:    "#E3474F",
          foreground: "#FFFFFF",
        },
        popover: {
          DEFAULT:    "#FFFFFF",
          foreground: "#1B3A5C",
        },
        card: {
          DEFAULT:    "#FFFFFF",
          foreground: "#1B3A5C",
        },
        success: {
          DEFAULT:    "#2F6B4A",
          foreground: "#FFFFFF",
        },
        warning: {
          DEFAULT:    "#B07A2A",
          foreground: "#FFFFFF",
        },
        error: {
          DEFAULT:    "#B93A41",
          foreground: "#FFFFFF",
        },
        pending: {
          DEFAULT:    "#8A93A0",
          foreground: "#FFFFFF",
        },
      },

      fontFamily: {
        display: ["var(--font-oswald)", "Oswald", "Arial Narrow", "sans-serif"],
        heading: ["var(--font-oswald)", "Oswald", "Arial Narrow", "sans-serif"],
        serif:   ["var(--font-oswald)", "Oswald", "Arial Narrow", "sans-serif"],
        sans:    ["var(--font-space-mono)", "Space Mono", "Courier New", "monospace"],
        body:    ["var(--font-space-mono)", "Space Mono", "Courier New", "monospace"],
        mono:    ["var(--font-space-mono)", "Space Mono", "Courier New", "monospace"],
      },

      fontSize: {
        "display-2xl": ["4rem",   { lineHeight: "1.05", letterSpacing: "-0.01em" }],
        "display-xl":  ["3.25rem",{ lineHeight: "1.08", letterSpacing: "-0.01em" }],
        "display-lg":  ["2.5rem", { lineHeight: "1.12" }],
        "display-md":  ["2rem",   { lineHeight: "1.18" }],
        "display-sm":  ["1.5rem", { lineHeight: "1.25" }],
      },

      boxShadow: {
        // Flat, hard offset shadows — layered shapes instead of soft elevation
        "stamp-sm":  "3px 3px 0 0 rgba(27,58,92,0.14)",
        "stamp-md":  "5px 5px 0 0 rgba(27,58,92,0.16)",
        "stamp-lg":  "8px 8px 0 0 rgba(27,58,92,0.18)",
        "stamp-red": "4px 4px 0 0 rgba(227,71,79,0.85)",
        "frame":     "10px 10px 0 0 rgba(27,58,92,0.2)",
      },

      borderRadius: {
        DEFAULT: "0px",
        sm:  "0px",
        md:  "0px",
        lg:  "0px",
        xl:  "0px",
        "2xl": "0px",
        full: "9999px",
      },

      spacing: {
        section: "5rem",        // 80px — spec: 60–100px vertical rhythm
        "section-lg": "7rem",   // 112px
        "gutter-tight": "1rem",
        "gutter-wide": "2rem",
        "pole": "14px",
      },

      maxWidth: {
        container: "1200px",
        story:     "680px",
        prose:     "680px",
        "prose-lg": "720px",
      },

      backgroundImage: {
        // Fine grid-paper texture (tactile stationery depth, no gradients)
        "grid-paper":
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Cpath d='M24 0H0v24' fill='none' stroke='%231B3A5C' stroke-opacity='0.08'/%3E%3C/svg%3E\")",
        "grid-paper-dark":
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Cpath d='M24 0H0v24' fill='none' stroke='%23FFFFFF' stroke-opacity='0.06'/%3E%3C/svg%3E\")",
        "barber-pole":
          "repeating-linear-gradient(45deg, #E3474F 0px, #E3474F 12px, #FFFFFF 12px, #FFFFFF 24px, #1B3A5C 24px, #1B3A5C 36px, #FFFFFF 36px, #FFFFFF 48px)",
        "barber-pole-h":
          "repeating-linear-gradient(90deg, #E3474F 0px, #E3474F 12px, #FFFFFF 12px, #FFFFFF 24px, #1B3A5C 24px, #1B3A5C 36px, #FFFFFF 36px, #FFFFFF 48px)",
      },

      transitionDuration: {
        150: "150ms",
        200: "200ms",
      },

      animation: {
        "reveal-up":   "revealUp 0.5s cubic-bezier(0.25,0.1,0.25,1) forwards",
        "fade-in-slow":"fadeInSlow 0.6s ease forwards",
        "spin-slow":   "spin 20s linear infinite",
      },

      keyframes: {
        revealUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        fadeInSlow: {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        spin: {
          from: { transform: "rotate(0deg)" },
          to:   { transform: "rotate(360deg)" },
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms"),
  ],
}
