import { hotTags } from '@/mock/data';

/**
 * 标签选择器（F2）：
 * - hotTags pill 多选，≤5（超限 onToast）
 * - 选中态品牌绿描边 + # 前缀
 * 分类默认标签（第一个）由 PublishSheet 负责插入与去重，本组件只做通用多选。
 */
export function TagPicker({
  value,
  onChange,
  onToast,
}: {
  value: string[];
  onChange: (tags: string[]) => void;
  onToast: (message: string) => void;
}) {
  const toggle = (tag: string) => {
    if (value.includes(tag)) {
      onChange(value.filter((t) => t !== tag));
      return;
    }
    if (value.length >= 5) {
      onToast('最多选择 5 个标签');
      return;
    }
    onChange([...value, tag]);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {hotTags.map((tag) => {
        const active = value.includes(tag);
        return (
          <button
            key={tag}
            type="button"
            onClick={() => toggle(tag)}
            className={`transition-bg rounded-pill border px-3 py-1.5 text-sm ${
              active
                ? 'border-brand bg-brand-light text-brand'
                : 'border-border bg-surface text-text-secondary'
            }`}
          >
            #{tag}
          </button>
        );
      })}
    </div>
  );
}
