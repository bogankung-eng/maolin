import type { LucideProps } from 'lucide-react';
import { Icons } from '@/lib/icons';

type IconName = keyof typeof Icons;

export interface IconProps extends LucideProps {
  name: IconName;
  size?: number | string; // 默认 24
  strokeWidth?: number; // 默认 2（线性图标统一）
  fill?: string; // 透传 SVG fill；缺省时 heartFill→currentColor，其余→none
  className?: string;
}

/** 统一 Lucide 线性图标组件（语义不变，仅渲染载体从 emoji 文本改为 SVG） */
export function Icon({ name, size = 24, strokeWidth = 2, fill, className, ...rest }: IconProps) {
  const LucideIcon = Icons[name];
  const resolvedFill = fill ?? (name === 'heartFill' ? 'currentColor' : 'none');
  return (
    <LucideIcon
      size={size}
      strokeWidth={strokeWidth}
      fill={resolvedFill}
      className={className}
      aria-hidden="true"
      {...rest}
    />
  );
}
