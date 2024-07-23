import { nextui, NextUIPluginConfig } from "@nextui-org/react";
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'pointed': 'radial-gradient(#ffffff33 1px, #00001010 1px)',
      },
      gridTemplateColumns: {
        'sm-card': 'repeat(auto-fill,minmax(130px,1fr))',
        'md-card': 'repeat(auto-fill,minmax(170px,1fr))',
        'bg-card': 'repeat(auto-fill,minmax(210px,1fr))',
      },
      gridTemplateRows: {
        'sm-card': 'repeat(auto-fill,minmax(130px,1fr))',
        'md-card': 'repeat(auto-fill,minmax(170px,1fr))',
        'bg-card': 'repeat(auto-fill,minmax(210px,1fr))',
      },
      animation: {
        'fade-in': 'fadeIn 0.25s',
        'fade-out': 'fadeOut 0.25s',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  darkMode: "class",
  plugins: [
    nextui({
      addCommonColors: true,
      themes: {
        dark: {
          colors: {
            background: "#151515", //18
            accented: "#2f2f2f", // Custom-named color for dark theme
            pure: { opposite: "#fff", theme: '#000' }, //opposite of theme, i.e for dark is pure white and vicevirsa
          }
        },
        light: {
          colors: {
            foreground: '#151515',
            accented: "#e0e0e0", // Custom-named color for dark theme
            pure: { opposite: "#000", theme: '#fff' }, //opposite of theme, i.e for light is pure black and vicevirsa
          }
        },
      }
    } as NextUIPluginConfig & { [key: string]: string | object | boolean }), //even thought nextUI uses tw-colors plugin, apparently it is not friendly with custom colors
  ],
};
export default config;
