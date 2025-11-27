import { defineConfig } from "@pandacss/dev";

export default defineConfig({
  // Whether to use css reset
  preflight: true,

  // Where to look for your css declarations
  include: ["./src/**/*.{js,jsx,ts,tsx}"],

  // Files to exclude
  exclude: [],

  // Useful for theme customization
  theme: {
    extend: {
      tokens: {
        colors: {
          // Dark mode (primary)
          background: { value: "#434343" },
          accent: { value: "#E9F355" },
          accentHover: { value: "#F5FF7A" },
          text: { value: "#E5E5E5" },
          textMuted: { value: "#CCCCCC" },
          cardBg: { value: "#2E2E2E" },
          cardBgHover: { value: "#3A3A3A" },
          border: { value: "#555" },
          error: { value: "#E69A9A" },
          errorBg: { value: "#5C2E2E" },
          success: { value: "#7ED97E" },
          successBg: { value: "#2E5C2E" },

          // Light mode (basic setup)
          light: {
            background: { value: "#FFFFFF" },
            text: { value: "#1A1A1A" },
            textMuted: { value: "#666" },
            accent: { value: "#E9F355" },
            accentHover: { value: "#F5FF7A" },
            cardBg: { value: "#F5F5F5" },
            cardBgHover: { value: "#E8E8E8" },
            border: { value: "#E0E0E0" },
            error: { value: "#C93A3A" },
            errorBg: { value: "#FFE5E5" },
            success: { value: "#2E7D32" },
            successBg: { value: "#E8F5E9" },
          },
        },
      },
      semanticTokens: {
        colors: {
          bg: {
            value: { base: "{colors.background}", _light: "{colors.light.background}" },
          },
          foreground: {
            value: { base: "{colors.text}", _light: "{colors.light.text}" },
          },
          primary: {
            value: { base: "{colors.accent}", _light: "{colors.light.accent}" },
          },
          card: {
            value: { base: "{colors.cardBg}", _light: "{colors.light.cardBg}" },
          },
        },
      },
    },
  },

  // The output directory for your css system
  outdir: "styled-system",

  // Use JSX runtime
  jsxFramework: "react",
});
