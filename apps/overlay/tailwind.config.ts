import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        adFadeIn: {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" }
        },
        adPulse: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.03)" }
        }
      },
      animation: {
        adFadeIn: "adFadeIn 240ms ease-out",
        adPulse: "adPulse 1.4s ease-in-out infinite"
      }
    }
  },
  plugins: []
};

export default config;
