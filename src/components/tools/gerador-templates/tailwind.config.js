/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ui: {
          base: '#F8F5F2',
          sidebar: '#FFFFFF',
          border: '#EAEAEA',
          text: '#3D3D3D',
          textSecondary: '#A1A1A1',
          primary: '#7A8A73',
          primaryHover: '#6A7A63',
          secondary: '#A8B5A0',
          danger: '#D97A7A',
          success: '#7AA88A',
          warning: '#E8B863',
          info: '#7A9FB5',
        },
      },
      boxShadow: {
        warm: '0 4px 12px rgba(232, 184, 99, 0.25)',
      },
      fontFamily: {
        heading: ['DM Serif Display', 'Playfair Display', 'serif'],
        body: ['Inter', 'DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}