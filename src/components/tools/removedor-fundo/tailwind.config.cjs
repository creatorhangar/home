module.exports = {
  content: [
    './index.html',
    './index.tsx',
    './App.tsx',
    './components/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
    './utils/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
        serif: ['Lora', 'serif'],
      },
      colors: {
        creme: '#FDFCF9',
        'text-primary': '#4A4A4A',
        'text-secondary': '#7A7A7A',
        'accent-primary': '#D9531E',
        'accent-secondary': '#E5734D',
        'accent-aurora': '#fbc2eb',
        'card-shadow': 'rgba(92, 82, 72, 0.08)',
      },
    },
  },
  plugins: [],
}