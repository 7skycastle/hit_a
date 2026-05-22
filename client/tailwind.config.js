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
          blue: "#2563EB",
          dark: "#111827",
          gray: "#6B7280",
          light: "#F6F7F9"
        },
        grade: {
          S: "#DC2626", // 강한 빨강
          A: "#F97316", // 주황
          B: "#7C3AED", // 보라
          C: "#2563EB", // 파랑
          D: "#059669", // 초록
          E: "#6B7280"  // 회색
        }
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans KR', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
