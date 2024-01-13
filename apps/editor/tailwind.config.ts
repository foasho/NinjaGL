import type { Config } from "tailwindcss";
import { nextui } from '@nextui-org/react';
import baseConfig from "@acme/tailwind-config";

export default {
  mode: 'jit',
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}',
    "../../packages/ui/**/*.{ts,tsx}",
    ...baseConfig.content, 
  ],
  presets: [baseConfig],
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    extend: {
      keyframes: {
        slowspin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        slowspin: 'slowspin 4s linear infinite',
      },
    },
  },
  variants: {
    extend: {},
  },
  // darkMode: 'class',
  plugins: [
    nextui({
      themes: {
        light: {
          colors: {
            primary: {
              foreground: "#FFFFFF",
              DEFAULT: "#222121",
            },
            // @ts-ignore
            cyber: '#49D9D9',
            main: '#BA68C8',
            accent: '#FFBD4D',
          },
        },
        dark: {
          colors: {
            primary: {
              foreground: "#FFFFFF",
              DEFAULT: "#222121",
            },
            // @ts-ignore
            cyber: '#49D9D9',
            main: '#BA68C8',
            accent: '#FFBD4D',
          },
        },
      },
    }),
    function ({ addUtilities }: any) {
      const newUtilities = {
        '.vertical-rl': {
          writingMode: 'vertical-rl',
        },
        '.vertical-lr': {
          writingMode: 'vertical-lr',
        },
        '.horizontal-tb': {
          writingMode: 'horizontal-tb',
        },
      };
      addUtilities(newUtilities);
    },
    require('@tailwindcss/typography'),
  ],
} as Config;
