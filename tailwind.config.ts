import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/widgets/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
    './src/entities/**/*.{js,ts,jsx,tsx,mdx}',
    './src/shared/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
      backgroundImage: {
        'custom-radial': 'radial-gradient(162.5% 162.5% at 54.46% -42.86%, #5887ff 16.15%, #ffa0fb 72.4%)',
        'custom-radial-reverse': 'radial-gradient(162.5% 162.5% at 54.46% -42.86%, #ffa0fb 16.15%, #5887ff  72.4%)',
      },
      scale: {
        '60': '0.6',
      },
      keyframes: {
        'slide-in-left': {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'fade-in-scale': {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'pop-in': {
          '0%': { opacity: '0', transform: 'scale(0.5)' },
          '50%': { transform: 'scale(1.15)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 4px 1px rgba(59,130,246,0.4)' },
          '50%': { boxShadow: '0 0 8px 3px rgba(59,130,246,0.6)' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.6', transform: 'scale(1.3)' },
        },
        'typing-bounce': {
          '0%, 60%, 100%': { transform: 'translateY(0)' },
          '30%': { transform: 'translateY(-4px)' },
        },
        'glow-border': {
          '0%, 100%': { boxShadow: '0 0 0 2px rgba(59,130,246,0.2)' },
          '50%': { boxShadow: '0 0 0 4px rgba(59,130,246,0.15)' },
        },
        'message-highlight': {
          '0%': { backgroundColor: 'rgba(59,130,246,0.12)' },
          '100%': { backgroundColor: 'transparent' },
        },
      },
      animation: {
        'slide-in-left': 'slide-in-left 0.25s ease-out',
        'slide-in-right': 'slide-in-right 0.25s ease-out',
        'fade-in-scale': 'fade-in-scale 0.15s ease-out',
        'pop-in': 'pop-in 0.3s ease-out',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'pulse-dot': 'pulse-dot 1.5s ease-in-out infinite',
        'typing-bounce-1': 'typing-bounce 1.2s ease-in-out infinite',
        'typing-bounce-2': 'typing-bounce 1.2s ease-in-out 0.15s infinite',
        'typing-bounce-3': 'typing-bounce 1.2s ease-in-out 0.3s infinite',
        'glow-border': 'glow-border 2s ease-in-out infinite',
        'message-highlight': 'message-highlight 1.5s ease-out forwards',
      },
    },
  },
  plugins: [],
};
export default config;
