import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0F172A',
          light: '#1E293B',
        },
        accent: {
          DEFAULT: '#3B82F6',
          light: '#EFF6FF',
          dark: '#1D4ED8',
        },
        success: {
          DEFAULT: '#10B981',
          light: '#ECFDF5',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FFFBEB',
        },
        error: {
          DEFAULT: '#EF4444',
          light: '#FEF2F2',
        },
        info: {
          DEFAULT: '#6366F1',
          light: '#EEF2FF',
        },
        surface: '#FFFFFF',
        'surface-elevated': '#F1F5F9',
        border: '#E2E8F0',
        'border-strong': '#CBD5E1',
        'text-primary': '#0F172A',
        'text-secondary': '#475569',
        'text-tertiary': '#94A3B8',
        'text-disabled': '#CBD5E1',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '14px',
        xl: '20px',
      },
      boxShadow: {
        sm: '0 1px 3px rgba(15, 23, 42, 0.06)',
        md: '0 4px 8px rgba(15, 23, 42, 0.08)',
        lg: '0 8px 16px rgba(15, 23, 42, 0.12)',
      },
    },
  },
  plugins: [],
};

export default config;
