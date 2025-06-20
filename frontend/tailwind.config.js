/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}', // adjust based on your project structure
    './public/index.html'
  ],
  theme: {
    extend: {
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '20px',
      },
      colors: {
        // Optional: Define custom semi-transparent white for fallback
        'white-70': 'rgba(255, 255, 255, 0.7)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'), // optional for better form styling
  ],
};
