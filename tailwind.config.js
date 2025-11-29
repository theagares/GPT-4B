/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#635BFF",
      },
      fontFamily: {
        display: ["Pretendard", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glass: "0 16px 45px rgba(99, 91, 255, 0.18)",
      },
    },
  },
  plugins: [],
};

