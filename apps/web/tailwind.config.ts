import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0D0D1A",
        foreground: "#FFFFFF",
        muted: "#2D1B4E",
        accent: {
          1: "#FF3AF2", // Magenta
          2: "#00F5D4", // Cyan
          3: "#FFE600", // Yellow
          4: "#FF6B35", // Orange
          5: "#7B2FFF", // Purple
        },
      },
      fontFamily: {
        outfit: ["var(--font-outfit)", "sans-serif"],
        sans: ["var(--font-dm-sans)", "sans-serif"],
        display: ["var(--font-bungee)", "cursive"],
      },
      boxShadow: {
        'hard-sm': '4px 4px 0 0 rgba(0,0,0,1)',
        'hard': '8px 8px 0 0 rgba(0,0,0,1)',
        'hard-lg': '12px 12px 0 0 rgba(0,0,0,1)',
        'glow-accent-1': '0 0 20px rgba(255, 58, 242, 0.5)',
        'glow-accent-2': '0 0 20px rgba(0, 245, 212, 0.5)',
      },
      textShadow: {
        'sm': '2px 2px 0 var(--accent-1)',
        'md': '4px 4px 0 var(--accent-1)',
        'lg': '6px 6px 0 var(--accent-1)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-reverse': 'float-r 5s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 4s ease infinite',
        'spin-slow': 'spin-slow 20s linear infinite',
        'wiggle': 'wiggle 1.2s ease-in-out infinite',
        'bounce-subtle': 'bounce-s 2s ease-in-out infinite',
        'marquee': 'marquee 18s linear infinite',
      },
    },
  },
  plugins: [],
};
export default config;