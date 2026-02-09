import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#101820",
        signal: "#e94f37",
        mint: "#5adbb5",
        fog: "#f2f4f8"
      },
      boxShadow: {
        float: "0 20px 40px rgba(16,24,32,0.12)"
      }
    }
  },
  plugins: []
};

export default config;
