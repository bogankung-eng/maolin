export interface LogoProps {
  size?: number; // 默认 24（px）
  className?: string; // 透传（用于 animate-breathe / 定位）
}

/** 猫爪图形标：viewBox 0 0 32 32，fill=currentColor，颜色由父容器 color 决定 */
export function Logo({ size = 24, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <ellipse cx="16" cy="21" rx="8" ry="6.2" />
      <ellipse cx="8.2" cy="11" rx="2.9" ry="3.6" transform="rotate(-16 8.2 11)" />
      <ellipse cx="12.6" cy="7.6" rx="2.9" ry="3.6" transform="rotate(-6 12.6 7.6)" />
      <ellipse cx="19.4" cy="7.6" rx="2.9" ry="3.6" transform="rotate(6 19.4 7.6)" />
      <ellipse cx="23.8" cy="11" rx="2.9" ry="3.6" transform="rotate(16 23.8 11)" />
    </svg>
  );
}
