/** 圆形头像：优先渲染图片，无图时渲染 emoji */
export function Avatar({ emoji, size = 38, src }: { emoji: string; size?: number; src?: string }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-light"
      style={{ width: size, height: size, fontSize: size * 0.55 }}
    >
      {src ? <img src={src} alt="" className="h-full w-full object-cover" /> : <span>{emoji}</span>}
    </div>
  );
}
