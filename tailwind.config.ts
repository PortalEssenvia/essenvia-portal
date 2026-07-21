import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        display: ["Cinzel", "Georgia", "serif"],
        body: ["Montserrat", "system-ui", "sans-serif"],
        serif: ["Cinzel", "Georgia", "serif"],
      },
      colors: {
        border:      "hsl(var(--border))",
        input:       "hsl(var(--input))",
        ring:        "hsl(var(--ring))",
        background:  "hsl(var(--background))",
        foreground:  "hsl(var(--foreground))",
        primary:     { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary:   { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        muted:       { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent:      { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        popover:     { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
        card:        { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },

        /* ── Paleta MRC ── */
        verde: {
          profundo: "hsl(var(--verde-profundo))",
          medio:    "hsl(var(--verde-medio))",
          claro:    "hsl(var(--verde-claro))",
        },
        bege: {
          DEFAULT: "hsl(var(--bege))",
          claro:   "hsl(var(--bege-claro))",
        },
        dourado: {
          DEFAULT: "hsl(var(--dourado))",
          claro:   "hsl(var(--dourado-claro))",
          vivo:    "hsl(var(--dourado-vivo))",
        },
        cobre:        "hsl(var(--cobre))",
        "azul-escuro":"hsl(var(--azul-escuro))",
        creme:         "hsl(var(--creme))",
      },
      borderRadius: {
        lg:  "var(--radius)",
        md:  "calc(var(--radius) - 2px)",
        sm:  "calc(var(--radius) - 4px)",
        xl:  "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
        "3xl": "calc(var(--radius) + 16px)",
      },
      spacing: {
        "header": "72px",
      },
      boxShadow: {
        soft:  "var(--shadow-soft)",
        gold:  "var(--shadow-gold)",
        card:  "var(--shadow-card)",
        deep:  "var(--shadow-deep)",
        inner: "var(--shadow-inner)",
      },
      backgroundImage: {
        "gradient-hero": "var(--gradient-hero)",
        "gradient-soft": "var(--gradient-soft)",
        "gradient-gold": "var(--gradient-gold)",
        "gradient-deep": "var(--gradient-deep)",
        "gradient-warm": "var(--gradient-warm)",
        "gradient-card": "var(--gradient-card)",
      },
      transitionDuration: {
        400: "400ms",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to:   { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to:   { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up":   "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
  ],
} satisfies Config;
