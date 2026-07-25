import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: Variant;
}

/** 主按钮：圆角 10，品牌绿 */
export function Button({
  children,
  variant = 'primary',
  className = '',
  ...rest
}: ButtonProps) {
  const base = 'rounded-button px-4 py-2 text-sm font-medium transition-bg disabled:opacity-50';
  const styles =
    variant === 'primary'
      ? 'bg-brand text-white'
      : variant === 'secondary'
        ? 'bg-brand-light text-brand-dark'
        : 'bg-transparent text-brand-dark';
  return (
    <button className={`${base} ${styles} ${className}`} {...rest}>
      {children}
    </button>
  );
}
