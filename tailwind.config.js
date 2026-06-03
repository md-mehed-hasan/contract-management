/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}', './utils/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#172033',
        mist: '#F5F7FA',
        brand: {
          50: '#EEF7FF',
          100: '#D9EDFF',
          500: '#1B77C5',
          600: '#145F9D',
          700: '#124F82'
        }
      },
      boxShadow: {
        panel: '0 18px 45px rgba(23, 32, 51, 0.08)'
      }
    }
  },
  plugins: []
};
