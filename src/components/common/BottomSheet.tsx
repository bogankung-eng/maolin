import { useEffect, useState, type ReactNode } from 'react';

/** 底部弹层：从底滑入 300ms，顶部 20 圆角，遮罩 0.5，点遮罩/取消/下滑关闭 */
export function BottomSheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}) {
  const [render, setRender] = useState(open);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (open) {
      setRender(true);
      setClosing(false);
    }
  }, [open]);

  if (!render) return null;

  const handleClose = () => {
    setClosing(true);
    window.setTimeout(() => {
      setRender(false);
      onClose();
    }, 250);
  };

  return (
    <div className="absolute inset-0 z-50">
      {/* 遮罩 */}
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} aria-hidden="true" />
      {/* 面板：顶部 20 圆角，从底滑入 */}
      <div
        className={`absolute inset-x-0 bottom-0 max-h-[85%] w-full overflow-y-auto rounded-t-sheet bg-surface ${
          closing ? 'animate-slide-down' : 'animate-slide-up'
        }`}
      >
        {/* 拖拽把手 */}
        <div className="flex justify-center pb-1 pt-3">
          <div className="h-1 w-10 rounded-full bg-border" />
        </div>
        {title && <div className="px-4 pb-2 text-base font-semibold text-text">{title}</div>}
        <div className="px-4 pb-6">{children}</div>
      </div>
    </div>
  );
}
