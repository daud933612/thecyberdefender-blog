/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#050B14',
          surface: '#091120',
          card: '#0C1527',
          border: 'rgba(0, 229, 255, 0.18)',
          accent: '#00E5FF',
          blue: '#1E60FF',
        }
      },
      boxShadow: {
        'neon': '0 0 20px rgba(0, 229, 255, 0.15)',
        'neon-strong': '0 0 30px rgba(0, 229, 255, 0.35)',
      }
    },
  },
  plugins: [],
};