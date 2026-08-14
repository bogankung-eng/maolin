import { useRef } from 'react';
import { Icon } from '@/components/common/Icon';
import {
  MAX_IMAGES,
  MAX_IMAGE_BYTES,
  MAX_TOTAL_IMAGE_BYTES,
  dataUrlBytes,
  isRealImage,
} from '@/lib/image';

/** FileReader 读取文件为 dataURL */
function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('读取图片失败'));
    reader.readAsDataURL(file);
  });
}

/**
 * 图片选择器（F4）：
 * - 隐藏 file input（multiple accept=image/*）+ 缩略图网格 + 「＋」添加 tile（≤9）
 * - FileReader → dataURL；单图 ≤800KB / 总量 ≈4MB / 张数 ≤9 三重拦截
 * - 可删除缩略图
 */
export function ImagePicker({
  images,
  onChange,
  onToast,
}: {
  images: string[];
  onChange: (images: string[]) => void;
  onToast: (message: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    // 重置 value，允许再次选择同一文件
    e.target.value = '';
    if (files.length === 0) return;

    if (images.length >= MAX_IMAGES) {
      onToast(`最多上传 ${MAX_IMAGES} 张图片`);
      return;
    }

    let next = [...images];
    let total = next.reduce((sum, src) => sum + dataUrlBytes(src), 0);

    for (const file of files) {
      // ① 张数拦截
      if (next.length >= MAX_IMAGES) {
        onToast(`最多上传 ${MAX_IMAGES} 张图片`);
        break;
      }
      // ② 单图拦截
      if (file.size > MAX_IMAGE_BYTES) {
        onToast('单张图片不能超过 800KB');
        continue;
      }
      // ③ 总量拦截
      if (total + file.size > MAX_TOTAL_IMAGE_BYTES) {
        onToast('图片总量不能超过 4MB');
        break;
      }
      const dataUrl = await readAsDataURL(file);
      next = [...next, dataUrl];
      total += file.size;
    }

    onChange(next);
  };

  const removeAt = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className="grid grid-cols-3 gap-2">
        {images.map((src, i) => (
          <div
            key={`${src.slice(0, 24)}-${i}`}
            className="relative flex aspect-square items-center justify-center overflow-hidden rounded-button bg-bg"
          >
            {isRealImage(src) ? (
              <img src={src} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-3xl">{src}</span>
            )}
            <button
              type="button"
              aria-label="删除图片"
              onClick={() => removeAt(i)}
              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/50 text-xs text-white"
            >
              <Icon name="x" size={12} />
            </button>
          </div>
        ))}
        {images.length < MAX_IMAGES && (
          <button
            type="button"
            aria-label="添加图片"
            onClick={() => inputRef.current?.click()}
            className="flex aspect-square items-center justify-center rounded-button border border-dashed border-border text-2xl text-text-tertiary transition-bg hover:border-brand"
          >
            <Icon name="plus" size={20} />
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleChange}
        className="hidden"
        data-testid="image-input"
      />
    </div>
  );
}
