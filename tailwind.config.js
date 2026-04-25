/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        camp: {
          orange:      '#F97316',
          'orange-dk': '#EA580C',
          green:       '#16A34A',
          'green-dk':  '#15803D',
          cream:       '#FFFBEF',
          sand:        '#FEF3C7',
          brown:       '#92400E',
          sky:         '#BAE6FD',
          forest:      '#166534',
        },
      },
      boxShadow: {
        camp:       '0 4px 24px -4px rgba(249,115,22,0.15)',
        'camp-green':'0 4px 24px -4px rgba(22,163,74,0.15)',
      },
    },
  },
  plugins: [],
};
