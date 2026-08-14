import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { BottomSheet } from '@/components/common/BottomSheet';
import { Button } from '@/components/common/Button';
import { PetPicker } from './PetPicker';
import { ImagePicker } from './ImagePicker';
import { TagPicker } from './TagPicker';
import { CategoryIcon, CategoryLabel } from '@/lib/icons';
import type { Category } from '@/types';

const CATEGORIES: Category[] = ['health', 'diet', 'behavior', 'gear', 'medical'];

/** 发布弹层：复用为发帖 / 提问两种模式（V3：发帖关联宠物+图片+标签；提问标题/详情双输入） */
export function PublishSheet() {
  const open = useAppStore((s) => s.publishOverlay.open);
  const mode = useAppStore((s) => s.publishOverlay.mode);
  const closePublish = useAppStore((s) => s.closePublish);
  const addPost = useAppStore((s) => s.addPost);
  const addQuestion = useAppStore((s) => s.addQuestion);
  const showToast = useAppStore((s) => s.showToast);
  const pets = useAppStore((s) => s.pets);

  // 发帖内容
  const [content, setContent] = useState('');
  // 提问双输入
  const [title, setTitle] = useState('');
  const [detail, setDetail] = useState('');
  // 公共
  const [category, setCategory] = useState<Category>('health');
  // 发帖关联宠物（默认第一只）
  const [petId, setPetId] = useState<string | undefined>(pets[0]?.id);
  // 提问可选关联宠物（默认不关联）
  const [questionPetId, setQuestionPetId] = useState<string | undefined>(undefined);
  // 发帖标签（分类中文名固定为第一个）
  const [tags, setTags] = useState<string[]>([CategoryLabel.health]);
  // 发帖图片
  const [images, setImages] = useState<string[]>([]);

  const isPost = mode === 'post';
  const selectedPet = pets.find((p) => p.id === petId);
  const petTag = selectedPet ? `${selectedPet.emoji} ${selectedPet.name}` : '🐶 豆豆';

  const reset = () => {
    setContent('');
    setTitle('');
    setDetail('');
    setCategory('health');
    setPetId(pets[0]?.id);
    setQuestionPetId(undefined);
    setTags([CategoryLabel.health]);
    setImages([]);
  };

  const handleCategoryChange = (c: Category) => {
    const oldLabel = CategoryLabel[category];
    setCategory(c);
    // 分类中文名作为第一个标签（去重），仅在发帖模式有意义
    setTags((prev) => [
      CategoryLabel[c],
      ...prev.filter((t) => t !== oldLabel && t !== CategoryLabel[c]),
    ]);
  };

  const handleTagsChange = (next: string[]) => {
    // 分类中文名固定第一位，去重，总 ≤5
    const catLabel = CategoryLabel[category];
    setTags([catLabel, ...next.filter((t) => t !== catLabel)].slice(0, 5));
  };

  const handlePublish = () => {
    if (isPost) {
      const text = content.trim();
      if (!text) {
        showToast('请输入内容');
        return;
      }
      addPost({
        content: text,
        petTag,
        petId,
        tags,
        category,
        images,
        source: 'recommend',
      });
      showToast('发布成功');
    } else {
      const t = title.trim();
      if (!t) {
        showToast('请输入标题');
        return;
      }
      addQuestion({
        category,
        title: t,
        content: detail.trim(),
        petId: questionPetId,
      });
      showToast('提问成功');
    }
    reset();
    closePublish();
  };

  return (
    <BottomSheet open={open} onClose={closePublish} title={isPost ? '发布动态' : '发起提问'}>
      {isPost ? (
        <>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            placeholder="分享你和毛孩子的故事…"
            className="transition-bg w-full resize-none rounded-button border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-brand"
          />

          <div className="mb-2 mt-4 text-xs text-text-secondary">关联宠物</div>
          <PetPicker pets={pets} value={petId} onChange={setPetId} />
        </>
      ) : (
        <>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={60}
            placeholder="一句话概括你的问题"
            className="transition-bg w-full rounded-button border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-brand"
          />
          <textarea
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            rows={4}
            placeholder="补充更多细节（选填）…"
            className="transition-bg mt-3 w-full resize-none rounded-button border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-brand"
          />

          <div className="mb-2 mt-4 text-xs text-text-secondary">关联宠物</div>
          <PetPicker pets={pets} value={questionPetId} onChange={setQuestionPetId} allowNone />
        </>
      )}

      <div className="mb-2 mt-4 text-xs text-text-secondary">选择分类</div>
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => {
          const active = category === c;
          const CatIcon = CategoryIcon[c];
          return (
            <button
              key={c}
              onClick={() => handleCategoryChange(c)}
              className={`transition-bg flex items-center gap-1 rounded-pill border px-3 py-1.5 text-sm ${
                active
                  ? 'border-brand bg-brand text-white'
                  : 'border-border bg-surface text-text-secondary'
              }`}
            >
              <CatIcon size={16} />
              {CategoryLabel[c]}
            </button>
          );
        })}
      </div>

      {isPost && (
        <>
          <div className="mb-2 mt-4 text-xs text-text-secondary">添加标签（最多 5 个）</div>
          <TagPicker value={tags} onChange={handleTagsChange} onToast={showToast} />

          <div className="mb-2 mt-4 text-xs text-text-secondary">添加图片（最多 9 张）</div>
          <ImagePicker images={images} onChange={setImages} onToast={showToast} />
        </>
      )}

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
