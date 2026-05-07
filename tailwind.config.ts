import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#F1ECFF",
          100: "rgba(109, 61, 242, 0.12)",
          200: "rgba(109, 61, 242, 0.20)",
          300: "#B7A4FF",
          400: "#8B68FF",
          500: "#7650F6",
          600: "#6D3DF2",
          700: "#5628D8",
          800: "#3B159C",
          900: "#26105F",
        },
        cream: "#FBFAF8",
        lavender: "rgba(109, 40, 217, 0.22)",
        ink: "#080D2F",
        activity: {
          gym: "#6D3DF2",
          focus: "#7EC8A0",
          outside: "#FF8C69",
          social: "#6D3DF2",
        },
      },
      borderRadius: {
        card: "24px",
        pill: "9999px",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        serif: ["Inter", "sans-serif"],
      },
      boxShadow: {
        soft: "0 24px 54px -18px rgba(109, 61, 242, 0.22)",
        nav: "0 -20px 46px rgba(74, 104, 158, 0.2)",
      },
    },
  },
  plugins: [],
} satisfies Config;
