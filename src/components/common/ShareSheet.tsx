import { useAppStore } from '@/store/useAppStore';
import { BottomSheet } from '@/components/common/BottomSheet';
import { Button } from '@/components/common/Button';

/** 安全复制：优先 navigator.clipboard，失败/不可用返回 false（不抛错） */
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/** 分享链接：`${origin}/post/:id`（SPA 需服务端 fallback 才能跨设备直达） */
function buildShareUrl(postId: string): string {
  return `${window.location.origin}/post/${postId}`;
}

/**
 * 分享弹层（F8）：复用 BottomSheet。
 * - 「复制链接」→ clipboard.writeText + incrementShare + toast「链接已复制」
 * - navigator.share 可用时展示「系统分享」，调用系统分享成功也 shares +1；不可用则隐藏
 * - 海报 P2 不实现
 */
export function ShareSheet() {
  const shareOverlay = useAppStore((s) => s.shareOverlay);
  const closeShare = useAppStore((s) => s.closeShare);
  const incrementShare = useAppStore((s) => s.incrementShare);
  const showToast = useAppStore((s) => s.showToast);

  const postId = shareOverlay.postId;
  const canSystemShare = typeof navigator.share === 'function';

  const handleCopy = async () => {
    if (!postId) return;
    await copyToClipboard(buildShareUrl(postId));
    incrementShare(postId);
    showToast('链接已复制');
    closeShare();
  };

  const handleSystemShare = async () => {
    if (!postId) return;
    if (canSystemShare) {
      try {
        await navigator.share({ title: '毛邻分享', url: buildShareUrl(postId) });
        incrementShare(postId);
        showToast('分享成功');
      } catch {
        // 用户取消系统分享：不计数、不提示
      }
    } else {
      // 降级为复制链接
      await handleCopy();
      return;
    }
    closeShare();
  };

  return (
    <BottomSheet open={shareOverlay.open} onClose={closeShare} title="分享">
      <div className="flex gap-2">
        <Button variant="secondary" className="flex-1" onClick={handleCopy}>
          复制链接
        </Button>
        {canSystemShare && (
          <Button className="flex-1" onClick={handleSystemShare}>
            系统分享
          </Button>
        )}
      </div>
    </BottomSheet>
  );
}
