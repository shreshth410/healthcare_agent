/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-blue': 'var(--blue)',
        'brand-green': 'var(--green)',
        'brand-red': 'var(--red)',
        'bg-base': 'var(--bg)',
        'bg-surface': 'var(--surface)',
        'bg-panel': 'var(--bg-2)',
        'border-base': 'var(--border)',
        'border-lite': 'var(--border-2)',
        'text-primary': 'var(--t1)',
        'text-default': 'var(--t2)',
        'text-muted': 'var(--t3)',
        'text-subtle': 'var(--t4)',
        'text-inverse': 'var(--inv)',
      },
      boxShadow: {
        'xs': 'var(--sh-xs)',
        'sm': 'var(--sh-sm)',
        'md': 'var(--sh-md)',
        'lg': 'var(--sh-lg)',
      },
      borderRadius: {
        'sm': 'var(--r-sm)',
        'md': 'var(--r-md)',
        'lg': 'var(--r-lg)',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
