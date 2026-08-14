import type { Pet } from '@/types';

/**
 * 发帖 / 提问关联宠物选择器（F3）：
 * - 多宠横排单选，默认选中第一个宠物（value 为空时）
 * - 选中态绿描边 + emoji + 名称
 * - 空宠列表回退展示「🐶 豆豆」（不阻塞发布）
 * - allowNone=true 时前置「不关联」项，value === undefined 表示不关联（提问模式用）
 */
export function PetPicker({
  pets,
  value,
  onChange,
  allowNone = false,
}: {
  pets: Pet[];
  value?: string;
  onChange: (petId?: string) => void;
  allowNone?: boolean;
}) {
  if (pets.length === 0) {
    return (
      <div className="flex gap-2">
        <div className="flex shrink-0 items-center gap-1.5 rounded-pill border-2 border-brand bg-brand-light px-3 py-1.5">
          <span className="text-xl">🐶</span>
          <span className="text-sm text-text">豆豆</span>
        </div>
      </div>
    );
  }

  // 非 allowNone 模式：value 为空回退默认第一只；allowNone 模式：value 为空即「不关联」
  const selected = value ?? pets[0].id;

  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto">
      {allowNone && (
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className={`flex shrink-0 items-center gap-1.5 rounded-pill border-2 px-3 py-1.5 transition-bg ${
            value === undefined
              ? 'animate-pop border-brand bg-brand-light'
              : 'border-border bg-surface'
          }`}
        >
          <span className="text-sm text-text">不关联</span>
        </button>
      )}
      {pets.map((pet) => {
        const active = allowNone ? value === pet.id : pet.id === selected;
        return (
          <button
            key={pet.id}
            type="button"
            onClick={() => onChange(pet.id)}
            className={`flex shrink-0 items-center gap-1.5 rounded-pill border-2 px-3 py-1.5 transition-bg ${
              active ? 'animate-pop border-brand bg-brand-light' : 'border-border bg-surface'
            }`}
          >
            <span className="text-xl">{pet.emoji}</span>
            <span className="text-sm text-text">{pet.name}</span>
          </button>
        );
      })}
    </div>
  );
}
