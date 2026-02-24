export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./views/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./App.tsx",
    "./index.tsx",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: '#121212',
        'dark-bg': '#1a1a1a',
        'purple-accent': '#a855f7',
        university: {
          dark: '#1e1b4b', // Deep Indigo
          gold: '#818cf8', // Indigo-400
          cream: '#f5f3ff', // Violet-50
          accent: '#4f46e5', // Indigo-600
        }
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        serif: ['Cormorant Garamond', 'serif'],
      },
    },
  },
  plugins: [],
}
