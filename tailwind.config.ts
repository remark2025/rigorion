import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        inter: ["Inter", "sans-serif"],
        roboto: ["Roboto", "sans-serif"],
        "open-sans": ["Open Sans", "sans-serif"],
        "comic-sans": ["Comic Neue", "cursive"],
        poppins: ["Poppins", "sans-serif"],
        merriweather: ["Merriweather", "serif"],
        "dancing-script": ["Dancing Script", "cursive"],
        ubuntu: ["Ubuntu", "sans-serif"],
        "source-sans": ["Source Sans Pro", "system-ui", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#00BCD4",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#E3F2FD",
          foreground: "#1976D2",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        mono: {
          bg: "#FFFFFF",
          text: "#1A1A1A",
          border: "#E5E5E5",
          hover: "#F5F5F5",
          muted: "#717171",
          accent: "#000000",
        },
        vue: {
          green: "#42b883",
          darkGreen: "#33a06f",
          gray: "#304455",
          lightGray: "#f8f8f8",
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "correct-pulse": {
          '0%, 100%': { backgroundColor: 'transparent' },
          '50%': { backgroundColor: 'rgba(34, 197, 94, 0.3)' },
        },
        "incorrect-pulse": {
          '0%, 100%': { backgroundColor: 'transparent' },
          '50%': { backgroundColor: 'rgba(239, 68, 68, 0.3)' },
        },
        "orange-glow": {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(249, 115, 22, 0.4)' },
          '50%': { boxShadow: '0 0 20px 10px rgba(249, 115, 22, 0)' },
        },
        "bubble": {
          '50%': { transform: 'translateY(0) scale(1)', opacity: '0.6' },
          '100%': { transform: 'translateY(-100vh) scale(0.5)', opacity: '0' },
        },
        "gradient-x": {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        "pulse-subtle": {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 5px rgba(22, 163, 74, 0.4)' },
          '50%': { opacity: '0.93', boxShadow: '0 0 12px rgba(22, 163, 74, 0.7)' },
        },
        "glow": {
          '0%, 100%': { boxShadow: '0 0 5px rgba(239, 68, 68, 0.6), 0 0 10px rgba(239, 68, 68, 0.4)' },
          '50%': { boxShadow: '0 0 15px rgba(239, 68, 68, 0.8), 0 0 20px rgba(239, 68, 68, 0.6)' },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "correct-pulse": "correct-pulse 1.5s ease-in-out",
        "incorrect-pulse": "incorrect-pulse 1.5s ease-in-out",
        "orange-glow": "orange-glow 2s infinite",
        "bubble": "bubble 6s linear infinite",
        "gradient-x": "gradient-x 5s ease infinite",
        "pulse-subtle": "pulse-subtle 2.5s infinite ease-in-out",
        "glow": "glow 2s infinite ease-in-out",
      },
      backgroundSize: {
        'gradient-stretch': '200% 200%',
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require('@tailwindcss/container-queries'),
  ],
} satisfies Config;
