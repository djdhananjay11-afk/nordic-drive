export const designTokens = {
  color: {
    background: "hsl(220 40% 5%)",
    foreground: "hsl(210 24% 96%)",
    graphite: {
      950: "#0a0d12",
      900: "#171b21",
      800: "#252b33",
    },
    neon: {
      cyan: "hsl(184 100% 46%)",
      green: "hsl(158 92% 46%)",
      violet: "hsl(262 90% 68%)",
      amber: "hsl(38 96% 58%)",
      red: "hsl(354 92% 62%)",
    },
  },
  radius: {
    sm: "4px",
    md: "6px",
    lg: "8px",
  },
  motion: {
    fast: 0.18,
    base: 0.28,
    slow: 0.56,
    spring: {
      type: "spring",
      stiffness: 220,
      damping: 28,
    },
  },
} as const;
