import type { Pet } from '@/types';

/** 宠物卡片：品种标签 + 健康提醒 + 绿底图标 */
export function PetCard({ pet, onClick }: { pet: Pet; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 bg-surface border border-border rounded-pet p-3"
    >
      <div className="w-[52px] h-[52px] rounded-pet bg-brand-light flex items-center justify-center text-3xl shrink-0">
        {pet.emoji}
      </div>
      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-text">{pet.name}</span>
          <span className="text-xs text-brand bg-brand-light rounded-pill px-2 py-0.5">
            {pet.breedTag}
          </span>
        </div>
        {pet.healthReminder && (
          <span className="text-xs text-text-secondary mt-1 truncate">
            {pet.healthReminder}
          </span>
        )}
      </div>
    </div>
  );
}
