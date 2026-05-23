/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: {
            light: '#a78bfa',
            DEFAULT: '#7c3aed',
            dark: '#5b21b6',
          },
          green: {
            light: '#34d399',
            DEFAULT: '#10b981',
            dark: '#047857',
          }
        },
        health: {
          normal: '#10b981',    // Green
          warning: '#f59e0b',   // Yellow/Orange
          emergency: '#ef4444', // Red
          offline: '#9ca3af',   // Grey
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      }
    },
  },
  plugins: [],
}
