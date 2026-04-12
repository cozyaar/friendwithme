/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#4A90E2',
          purple: '#9013FE',
          pink: '#FF2A85',
          light: '#F8F9FA',
          dark: '#1C1C1E',
          gray: '#8E8E93',
        }
      },
      fontFamily: {
        sans: ['var(--font-outfit)', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1.5rem',
        '2xl': '2rem',
        '3xl': '2.5rem',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #4A90E2 0%, #9013FE 50%, #FF2A85 100%)',
        'soft-gradient': 'linear-gradient(135deg, #f0f4ff 0%, #f6efff 50%, #fff0f5 100%)',
      },
    },
  },
  plugins: [],
}
