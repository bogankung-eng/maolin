/**
 * 安全振动（产品 P5）：存在性判断 + try/catch，默认 15ms。
 * 不支持（jsdom / 桌面浏览器无 navigator.vibrate）时静默降级，绝不抛错。
 */
export function safeVibrate(pattern: number | number[] = 15): void {
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return;
  try {
    navigator.vibrate(pattern);
  } catch {
    // 忽略振动失败（部分环境可能抛权限/实现异常）
  }
}
