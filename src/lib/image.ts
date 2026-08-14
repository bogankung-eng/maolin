// ============ 图片处理与容量常量 ============

/** 单帖最多图片张数 */
export const MAX_IMAGES = 9;
/** 单张图片最大字节数（≤800KB） */
export const MAX_IMAGE_BYTES = 800 * 1024;
/** 发布前图片总量上限（≈4MB，逼近 localStorage 5MB 配额但留有余量） */
export const MAX_TOTAL_IMAGE_BYTES = 4 * 1024 * 1024;

/**
 * 判断 src 是否为「真实图片」：
 * - data:image/ 开头（本地 dataURL）或 http 开头（远程图）→ 真实图片
 * - 其余（emoji 占位、空值）→ 非真实图片
 * 统一入口，禁止在组件内散写 startsWith('http')。
 */
export function isRealImage(src: string | undefined | null): boolean {
  if (!src) return false;
  return src.startsWith('data:image/') || src.startsWith('http');
}

/** 估算 dataURL 的字节数（取 base64 部分 *3/4）；非 dataURL 返回 0 */
export function dataUrlBytes(dataUrl: string): number {
  if (!dataUrl.startsWith('data:')) return 0;
  const comma = dataUrl.indexOf(',');
  const base64 = comma >= 0 ? dataUrl.slice(comma + 1) : '';
  return Math.floor((base64.length * 3) / 4);
}
