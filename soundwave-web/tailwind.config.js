/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#059669',
        'primary-hover': '#047857',
        background: '#0f172a',
        card: '#1e293b',
        muted: '#334155',
        'muted-hover': '#475569',
        'text-main': '#f1f5f9',
        'text-secondary': '#94a3b8',
        border: '#334155',
      },
    },
  },
  plugins: [],
}
