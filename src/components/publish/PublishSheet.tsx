import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { BottomSheet } from '@/components/common/BottomSheet';
import { Button } from '@/components/common/Button';
import { CategoryIcon, CategoryLabel } from '@/lib/icons';
import type { Category } from '@/types';

const CATEGORIES: Category[] = ['health', 'diet', 'behavior', 'gear', 'medical'];

/** 发布弹层：复用为发帖 / 提问两种模式 */
export function PublishSheet() {
  const open = useAppStore((s) => s.publishOverlay.open);
  const mode = useAppStore((s) => s.publishOverlay.mode);
  const closePublish = useAppStore((s) => s.closePublish);
  const addPost = useAppStore((s) => s.addPost);
  const addQuestion = useAppStore((s) => s.addQuestion);
  const showToast = useAppStore((s) => s.showToast);
  const pets = useAppStore((s) => s.pets);

  const [content, setContent] = useState('');
  const [category, setCategory] = useState<Category>('health');

  const isPost = mode === 'post';
  const defaultPetTag = pets[0] ? `${pets[0].emoji} ${pets[0].name}` : '🐶 豆豆';

  const reset = () => {
    setContent('');
    setCategory('health');
  };

  const handlePublish = () => {
    const text = content.trim();
    if (!text) {
      showToast('请输入内容');
      return;
    }
    if (isPost) {
      addPost({
        content: text,
        petTag: defaultPetTag,
        tags: [CategoryLabel[category]],
        category,
        images: [],
        source: 'recommend',
      });
      showToast('发布成功');
    } else {
      addQuestion({
        category,
        title: text.length > 50 ? text.slice(0, 50) : text,
        content: text,
      });
      showToast('提问成功');
    }
    reset();
    closePublish();
  };

  return (
    <BottomSheet open={open} onClose={closePublish} title={isPost ? '发布动态' : '发起提问'}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={5}
        placeholder={isPost ? '分享你和毛孩子的故事…' : '描述你遇到的问题，越详细越好…'}
        className="transition-bg w-full resize-none rounded-button border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-brand"
      />

      <div className="mb-2 mt-4 text-xs text-text-secondary">选择分类</div>
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => {
          const active = category === c;
          return (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`transition-bg flex items-center gap-1 rounded-pill border px-3 py-1.5 text-sm ${
                active
                  ? 'border-brand bg-brand text-white'
                  : 'border-border bg-surface text-text-secondary'
              }`}
            >
              <span>{CategoryIcon[c]}</span>
              {CategoryLabel[c]}
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex gap-2">
        <Button variant="secondary" className="flex-1" onClick={closePublish}>
          取消
        </Button>
        <Button className="flex-1" onClick={handlePublish}>
          {isPost ? '发布' : '提问'}
        </Button>
      </div>
    </BottomSheet>
  );
}
