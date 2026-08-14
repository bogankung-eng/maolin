import type { Pet } from '@/types';
import { Icon } from '@/components/common/Icon';

/**
 * 宠物卡片：品种标签 + 健康提醒 + 绿底图标。
 * 传入 onClick 时（我的页 → 宠物详情）显示右侧箭头 + 可点视觉反馈。
 */
export function PetCard({ pet, onClick }: { pet: Pet; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 rounded-pet border border-border bg-surface p-3 ${
        onClick ? 'cursor-pointer transition-transform active:scale-[0.98]' : ''
      }`}
    >
      <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-pet bg-brand-light text-3xl">
        {pet.emoji}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-2">
          <span className="font-medium text-text">{pet.name}</span>
          <span className="rounded-pill bg-brand-light px-2 py-0.5 text-xs text-brand">
            {pet.breedTag}
          </span>
        </div>
        {pet.healthReminder && (
          <span className="mt-1 truncate text-xs text-text-secondary">{pet.healthReminder}</span>
        )}
      </div>
      {onClick && <Icon name="chevronRight" size={18} className="shrink-0 text-text-tertiary" />}
    </div>
  );
}
