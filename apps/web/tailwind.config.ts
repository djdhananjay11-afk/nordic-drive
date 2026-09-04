import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./features/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1.5rem",
        md: "2rem",
      },
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        glass: {
          DEFAULT: "hsl(var(--glass))",
          strong: "hsl(var(--glass-strong))",
          border: "hsl(var(--glass-border))",
        },
        neon: {
          cyan: "hsl(var(--neon-cyan))",
          green: "hsl(var(--neon-green))",
          violet: "hsl(var(--neon-violet))",
          red: "hsl(var(--neon-red))",
          amber: "hsl(var(--neon-amber))",
        },
        graphite: {
          50: "#f6f7f8",
          100: "#e7eaee",
          200: "#ccd3db",
          300: "#a6b2bf",
          400: "#7a8a9b",
          500: "#5f6d7d",
          600: "#4a5562",
          700: "#3e4651",
          800: "#252b33",
          900: "#171b21",
          950: "#0a0d12",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        glow: "0 0 40px hsl(var(--neon-cyan) / 0.28)",
        "glow-green": "0 0 40px hsl(var(--neon-green) / 0.24)",
        glass: "0 24px 80px hsl(220 45% 2% / 0.45)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "SFMono-Regular", "monospace"],
      },
      keyframes: {
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        float: {
          "0%, 100%": { transform: "translate3d(0, 0, 0)" },
          "50%": { transform: "translate3d(0, -12px, 0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.55", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.04)" },
        },
      },
      animation: {
        "gradient-shift": "gradient-shift 14s ease infinite",
        float: "float 7s ease-in-out infinite",
        shimmer: "shimmer 1.8s linear infinite",
        "pulse-glow": "pulse-glow 4s ease-in-out infinite",
      },
      backgroundImage: {
        "cinematic-radial":
          "radial-gradient(circle at 20% 10%, hsl(var(--neon-cyan) / 0.22), transparent 28%), radial-gradient(circle at 78% 24%, hsl(var(--neon-violet) / 0.18), transparent 30%), linear-gradient(135deg, hsl(220 48% 4%), hsl(210 38% 8%) 45%, hsl(190 42% 6%))",
        "aurora-line":
          "linear-gradient(110deg, transparent, hsl(var(--neon-cyan) / 0.28), hsl(var(--neon-green) / 0.2), transparent)",
      },
    },
  },
  plugins: [animate],
} satisfies Config;

export default config;
