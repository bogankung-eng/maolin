export interface MascotProps {
  pose?: 'wave' | 'sit' | 'heart'; // 挥手 / 静坐 / 爱心
  size?: number; // 默认 48
  className?: string;
}

/**
 * 吉祥物「爪爪」：内联 SVG（≤2KB），fill=currentColor 适配深色。
 * 贯穿空态（sit）/ 加载（wave）/ 海报（heart）。
 */
export function Mascot({ pose = 'wave', size = 48, className = '' }: MascotProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      {/* 尾巴（静坐） */}
      {pose === 'sit' && (
        <path
          d="M46 46c6 3 8 9 5 13"
          fill="none"
          stroke="currentColor"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
      )}
      {/* 身体 */}
      <ellipse cx="32" cy="48" rx="16" ry="12" />
      {/* 头部 */}
      <circle cx="32" cy="26" r="13" />
      {/* 耳朵 */}
      <path d="M20 18 22 4 33 12Z" />
      <path d="M44 18 42 4 31 12Z" />
      {/* 眼睛（镂空为背景色） */}
      <circle cx="27" cy="26" r="2.2" fill="#fff" />
      <circle cx="37" cy="26" r="2.2" fill="#fff" />
      {/* 鼻子 */}
      <path d="M30.5 30h3l-1.5 2z" fill="#fff" />
      {/* 挥手手臂 + 爪 */}
      {pose === 'wave' && (
        <>
          <path
            d="M43 30c7-2 11-8 10-14"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <circle cx="53" cy="15" r="4.5" />
        </>
      )}
      {/* 爱心（两圆 + 下尖） */}
      {pose === 'heart' && (
        <>
          <circle cx="49" cy="12" r="4" />
          <circle cx="56" cy="12" r="4" />
          <path d="M45.5 15 59.5 15 52.5 26Z" />
        </>
      )}
    </svg>
  );
}
