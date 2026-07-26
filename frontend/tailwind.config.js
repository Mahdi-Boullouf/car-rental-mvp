/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f1729",
        ink2: "#354155",
        muted: "#697488",
        line: "#e4e9f1",
        line2: "#f1f4f9",
        surface: "#ffffff",
        brand: { DEFAULT: "#2f6bff", 600: "#2350e6" },
        navy: { 800: "#1a2438", 900: "#0b1120" },
        ok: "#0f9d58",
        okbg: "#e6f6ee",
        danger: "#e11d48",
        dangerbg: "#fdeaee",
      },
      fontFamily: {
        sans: ["Tajawal", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
      borderRadius: { xl2: "18px" },
      boxShadow: {
        soft: "0 1px 2px rgba(15,23,42,.06), 0 2px 6px rgba(15,23,42,.04)",
        lg2: "0 18px 44px rgba(15,23,42,.16)",
      },
      backgroundImage: {
        "grad-brand": "linear-gradient(135deg,#3b7bff 0%,#2350e6 100%)",
        "grad-navy": "linear-gradient(180deg,#1a2438 0%,#0b1120 100%)",
      },
    },
  },
  plugins: [],
};
