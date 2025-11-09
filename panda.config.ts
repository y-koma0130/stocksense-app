import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  // Whether to use css reset
  preflight: true,

  // Where to look for your css declarations
  include: ['./src/**/*.{js,jsx,ts,tsx}'],

  // Files to exclude
  exclude: [],

  // Useful for theme customization
  theme: {
    extend: {
      tokens: {
        colors: {
          // Dark mode (primary)
          background: { value: '#434343' },
          accent: { value: '#E9F355' },
          text: { value: '#E5E5E5' },
          cardBg: { value: '#2E2E2E' },

          // Light mode (basic setup)
          light: {
            background: { value: '#FFFFFF' },
            text: { value: '#1A1A1A' },
            accent: { value: '#E9F355' },
            cardBg: { value: '#F5F5F5' },
          },
        },
      },
      semanticTokens: {
        colors: {
          bg: {
            value: { base: '{colors.background}', _light: '{colors.light.background}' },
          },
          foreground: {
            value: { base: '{colors.text}', _light: '{colors.light.text}' },
          },
          primary: {
            value: { base: '{colors.accent}', _light: '{colors.light.accent}' },
          },
          card: {
            value: { base: '{colors.cardBg}', _light: '{colors.light.cardBg}' },
          },
        },
      },
    },
  },

  // The output directory for your css system
  outdir: 'styled-system',

  // Use JSX runtime
  jsxFramework: 'react',
})
