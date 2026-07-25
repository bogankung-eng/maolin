import type { Config } from 'tailwindcss';

// Tailwind 配置：将设计 Token（CSS 变量）映射到原子类
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: 'var(--color-brand)',
        'brand-light': 'var(--color-brand-light)',
        'brand-dark': 'var(--color-brand-dark)',
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        text: 'var(--color-text)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-tertiary': 'var(--color-text-tertiary)',
        border: 'var(--color-border)',
        warning: 'var(--color-warning)',
        'warning-bg': 'var(--color-warning-bg)',
        danger: 'var(--color-danger)',
        'danger-bg': 'var(--color-danger-bg)',
        behavior: 'var(--color-behavior)',
        'behavior-bg': 'var(--color-behavior-bg)',
        gear: 'var(--color-gear)',
        'gear-bg': 'var(--color-gear-bg)',
        error: 'var(--color-error)',
        'error-bg': 'var(--color-error-bg)',
        resolved: 'var(--color-resolved-text)',
        'resolved-bg': 'var(--color-resolved-bg)',
        urgent: 'var(--color-urgent-text)',
        'urgent-bg': 'var(--color-urgent-bg)',
      },
      spacing: {
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        6: '24px',
        8: '32px',
      },
      borderRadius: {
        pill: 'var(--radius-pill)',
        button: 'var(--radius-button)',
        sheet: 'var(--radius-sheet-top)',
        pet: 'var(--radius-pet)',
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
      transitionTimingFunction: {
        maolin: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
      },
      maxWidth: {
        app: '420px',
      },
    },
  },
  plugins: [],
} satisfies Config;
