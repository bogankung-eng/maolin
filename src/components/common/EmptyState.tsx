import type { ReactNode } from 'react';
import { Mascot } from './Mascot';

export interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode; // 可选行动按钮（去发帖/去提问/返回）
  size?: 'sm' | 'md'; // 吉祥物尺寸 sm=48 md=64，默认 md
  className?: string;
}

/** 统一空态：浅绿底圆角方块 + 吉祥物「爪爪」 + 文案 + 可选行动，内置 fadeUp */
export function EmptyState({ title, description, action, size = 'md', className }: EmptyStateProps) {
  const box = size === 'md' ? 'h-16 w-16' : 'h-12 w-12';
  const mascot = size === 'md' ? 40 : 30;
  return (
    <div
      className={`animate-fade-up flex flex-col items-center justify-center py-16 text-center ${className ?? ''}`}
    >
      <div className={`flex ${box} items-center justify-center rounded-2xl bg-brand-light text-brand`}>
        <Mascot pose="sit" size={mascot} />
      </div>
      <div className="mt-3 text-sm text-text-tertiary">{title}</div>
      {description && <div className="mt-1 text-xs text-text-tertiary">{description}</div>}
      {action && <div className="mt-6 flex justify-center gap-2">{action}</div>}
    </div>
  );
}
