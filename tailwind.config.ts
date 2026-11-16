import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      animation: {
        'slideUp': 'slideUp 1s ease-out forwards',
      },
      keyframes: {
        slideUp: {
          'from': { transform: 'translateY(2.5rem)', opacity: '0' },
          'to': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      colors: {
        white: {
          1: "#FFFFFF",
          2: "#F8F8FF",
          3: "#FEFEFA",
          4: "rgba(255, 255, 255, 0.64)",
          5: "rgba(255, 255, 255, 0.80)",
        },
        black: {
          1: "#15171C",
          2: "#2b1f1f",
          3: "#101114",
          4: "#252525",
          5: "#2E3036",
          6: "#24272C",
          7: "#2D2D2D",
        },
        gray: {
          1: "#707070",
          5: "#F1F5F8",
          2: "#111827",
          3: "#6b7280",
          4: "#e5e7eb",
          6: "#453030",
          7: "#B1B1B1",
          8: "#A9A9A9"
        },
        purple: {
          1: "#4f46e5"
        },

        red: {
          1: "#CD5C5C",
          2: "#DC143C",
          3: "#FF6347",
          4: "#B22222",
        },
        gold: {
          1: "#f59e0b",
          2: "#CBA135",
          3: "#A67C00",
          4: "#8B6B00",
          5: "#A47C48",
          6: "#CFB53B",
          7: "#B88900",
          8: "#D4AF37",
          9: "#E6BE8A",
          10: "#C9A86A",
          11: "#FFD700"
        },

        blue: {
          1: "#87CEEB"
        }

      },
      fontFamily: {
        playfair: ['var(--font-playfair)'],
        montserrat: ['var(--font-montserrat)'],
        poppins: ['var(--font-poppins)'],
        dmSerif: ['var(--font-dm-serif)'],
        robotoSlab: ['var(--font-roboto-slab)'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      zIndex: {
        100: '100',
        70: '70',
      },
    },
  },
  plugins: [],
};

export default config;