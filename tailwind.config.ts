import type { Config } from 'tailwindcss'

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: '#121212',
        fg: '#FFFFFF',
        muted: '#BDBDBD',
        primary: '#673AB7',
        accent: '#FF4081',
        inputBg: '#2C2C2C',
        border: '#333333',
        divider: '#2b2b2b',
        'platform-facebook': '#1877F2',
        'platform-instagram': '#E1306C',
        'platform-google-search': '#4285F4',
        'platform-google-display': '#34A853',
        'platform-youtube': '#FF0000',
        'platform-tiktok': '#69C9D0',
        'platform-linkedin': '#0A66C2',
      },
      borderRadius: {
        'xl': '20px',
        'sm': '12px',
      },
      boxShadow: {
        'elev': '0 12px 36px rgba(0, 0, 0, .40)',
        'focus': '0 0 0 3px rgba(103, 58, 183, 0.25)',
      },
      fontSize: {
        'xs': ['12px', '16px'],
        'sm': ['13px', '18px'],
        'base': ['15px', '22px'],
        'lg': ['17px', '24px'],
        'xl': ['20px', '28px'],
        '2xl': ['24px', '32px'],
        '3xl': ['28px', '36px'],
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
    },
  },
  plugins: [],
} satisfies Config