/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary dark palette
        void: '#030712',
        abyss: '#0a0f1a',
        deep: '#111827',
        slate: '#1e293b',
        
        // Accent colors
        neon: '#10b981',
        neonLight: '#34d399',
        neonDark: '#059669',
        cyan: '#06b6d4',
        cyanLight: '#22d3ee',
        amber: '#f59e0b',
        amberLight: '#fbbf24',
        rose: '#f43f5e',
        roseLight: '#fb7185',
        
        // Neutral
        ghost: '#94a3b8',
        mist: '#cbd5e1',
        cloud: '#e2e8f0',
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
        body: ['DM Sans', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'gradient': 'gradient 8s ease infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)' },
          '100%': { boxShadow: '0 0 40px rgba(16, 185, 129, 0.6)' },
        },
      },
    },
  },
  plugins: [],
}
