import type { Config } from "tailwindcss";

import animate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: ["app/**/*.{ts,tsx}", "src/**/*.{ts,tsx}"],
  theme: {},
  plugins: [animate],
} satisfies Config;
