/** 骨架块：配合 .animate-shimmer 循环动画；尺寸/圆角由 className 控制，aria-hidden 避免被读屏 */
export function Skeleton({ className = '' }: { className?: string }) {
  return <div aria-hidden="true" className={`animate-shimmer ${className}`} />;
}
