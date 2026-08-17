import type { Post } from '@/types';
import { isRealImage } from '@/lib/image';

/** 海报绘制输入 */
export interface PosterSource {
  post: Post;
  authorName: string;
  authorEmoji: string;
  petTag: string;
}

const W = 640;
const H = 880;

/** 简单按宽度换行绘制，返回下一行 y 坐标 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number,
): number {
  let line = '';
  let yy = y;
  let lines = 0;
  for (const ch of text) {
    const test = line + ch;
    if (ctx.measureText(test).width > maxWidth && line !== '') {
      ctx.fillText(line, x, yy);
      yy += lineHeight;
      line = ch;
      lines += 1;
      if (lines >= maxLines) return yy;
    } else {
      line = test;
    }
  }
  if (line !== '') {
    ctx.fillText(line, x, yy);
    yy += lineHeight;
  }
  return yy;
}

/**
 * 海报生成（产品 P9）：Canvas 手绘，不引 html2canvas。
 * - 无 canvas（jsdom / 不支持）时返回 ''，调用方显示降级文案
 * - 首图仅直接绘制 emoji 占位；http 远程图（picsum）因 canvas 污染风险降级 emoji 占位
 * - 文案取前 60 字 + 品牌绿 slogan + 吉祥物爪印
 */
export function generatePoster(src: PosterSource): string {
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return ''; // 无 2d 上下文（jsdom）降级

  const sans = '"Noto Sans SC", system-ui, sans-serif';

  // 背景
  ctx.fillStyle = '#f7f6f2';
  ctx.fillRect(0, 0, W, H);

  // 顶部品牌：绿色圆形 Logo + 毛邻
  ctx.fillStyle = '#1d9e75';
  ctx.beginPath();
  ctx.arc(50, 50, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1a1a18';
  ctx.font = `bold 36px ${sans}`;
  ctx.textAlign = 'left';
  ctx.fillText('毛邻', 80, 62);

  // 作者行
  ctx.fillStyle = '#1a1a18';
  ctx.font = `28px ${sans}`;
  ctx.fillText(`${src.authorEmoji} ${src.authorName}`, 48, 120);
  ctx.fillStyle = '#6b6b67';
  ctx.font = `20px ${sans}`;
  ctx.fillText(src.petTag, 48, 152);

  // 首图区：emoji 占位（http/data 图统一 emoji 占位，避免跨域污染 / 异步加载）
  ctx.fillStyle = '#e1f5ee';
  ctx.fillRect(48, 180, W - 96, 300);
  const first = src.post.images[0];
  const emoji = isRealImage(first) || !first ? '🐾' : first;
  ctx.fillStyle = '#1d9e75';
  ctx.font = `120px ${sans}`;
  ctx.textAlign = 'center';
  ctx.fillText(emoji, W / 2, 370);

  // 文案（前 60 字）
  ctx.textAlign = 'left';
  ctx.fillStyle = '#1a1a18';
  ctx.font = `26px ${sans}`;
  const content = src.post.content.slice(0, 60);
  wrapText(ctx, content, 48, 540, W - 96, 38, 4);

  // 品牌 slogan
  ctx.fillStyle = '#1d9e75';
  ctx.font = `bold 24px ${sans}`;
  ctx.fillText('在毛邻，遇见同频的毛孩子', 48, 720);

  // 吉祥物爪印（三个小圆 + 大掌垫）
  ctx.fillStyle = '#1d9e75';
  const pad = (cx: number, cy: number, r: number) => {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  };
  pad(80, 820, 10);
  pad(100, 800, 10);
  pad(120, 820, 10);
  ctx.beginPath();
  ctx.ellipse(100, 830, 18, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.textAlign = 'left';
  return canvas.toDataURL('image/png');
}
