import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17231c",
        moss: "#2e5b46",
        fern: "#5f8168",
        mist: "#edf1e8",
        cream: "#f8f5ec",
        ember: "#d66a3f"
      },
      boxShadow: {
        card: "0 22px 60px rgba(23, 35, 28, 0.10)"
      }
    }
  },
  plugins: []
} satisfies Config;
