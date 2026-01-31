/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // Adicione isso aqui embaixo para "forçar" as cores das cartas
  safelist: [
    { pattern: /bg-(red|blue|green|yellow|purple|orange|slate|gray|indigo|amber|pink)-(400|500|600|700|800|900)/ },
    { pattern: /from-(red|blue|green|yellow|purple|orange|slate|gray|indigo|amber|pink)-(400|500|600|700|800|900)/ },
    { pattern: /to-(red|blue|green|yellow|purple|orange|slate|gray|indigo|amber|pink)-(400|500|600|700|800|900)/ },
    { pattern: /text-(white|black)/ },
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}