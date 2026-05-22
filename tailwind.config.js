/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: { extend: {} },
  // Safelist all dynamic color classes used in COLORS object
  safelist: [
    { pattern: /(bg|border|text)-(rose|blue|cyan|emerald|amber|violet|orange|red)-(50|100|300|600|700)/ },
  ],
  plugins: [],
};
