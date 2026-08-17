import { useEffect, useState } from 'react';
import { generatePoster } from '@/lib/poster';
import { Mascot } from '@/components/common/Mascot';
import { userMap, currentUser } from '@/mock/data';
import type { Post } from '@/types';

/** 海报预览 + 下载（产品 P9）：生成 Canvas PNG 后展示，无 canvas 环境显示降级文案 */
export function PosterPreview({ post, onClose }: { post: Post; onClose: () => void }) {
  const author = userMap[post.authorId] ?? currentUser;
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [unsupported, setUnsupported] = useState(false);

  useEffect(() => {
    const url = generatePoster({
      post,
      authorName: author.name,
      authorEmoji: author.avatarEmoji,
      petTag: post.petTag,
    });
    if (url) setDataUrl(url);
    else setUnsupported(true);
  }, [post, author]);

  const handleDownload = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `maolin-poster-${post.id}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="absolute inset-0 z-[70] flex flex-col bg-black/70">
      <div className="flex items-center justify-between px-4 py-3 text-white">
        <span className="text-base font-semibold">生成海报</span>
        <button onClick={onClose} aria-label="关闭海报" className="text-lg text-white">
          ×
        </button>
      </div>
      <div className="flex flex-1 items-center justify-center px-6">
        {unsupported ? (
          <div className="text-center text-sm text-white">当前环境暂不支持生成海报</div>
        ) : dataUrl ? (
          <img
            src={dataUrl}
            alt="帖子海报"
            className="w-full max-w-[300px] rounded-button shadow-lg"
          />
        ) : (
          <Mascot pose="heart" size={48} className="text-white" />
        )}
      </div>
      {dataUrl && (
        <div className="px-4 pb-6">
          <button
            onClick={handleDownload}
            className="w-full rounded-button bg-brand py-3 text-sm font-medium text-white"
          >
            保存到相册
          </button>
        </div>
      )}
    </div>
  );
}
