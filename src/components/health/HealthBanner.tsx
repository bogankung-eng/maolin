import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { Icon } from '@/components/common/Icon';
import { computeHealthStatus } from '@/types';
import type { HealthStatus, Pet } from '@/types';

interface PetAlert {
  pet: Pet;
  status: 'due-soon' | 'overdue'; // 仅异常级别（overdue > due-soon）
  title: string;
}

/**
 * 首页健康提醒横幅（P0-6）：
 * - 每宠取最高严重级（overdue > due-soon），仅异常宠物出横幅
 * - overdue 红「已过期」置顶 > due-soon 橙「即将到期」
 * - 无异常宠物 return null（不占位）
 * - 点击跳转 /pet/:id
 */
export function HealthBanner() {
  const navigate = useNavigate();
  const pets = useAppStore((s) => s.pets);
  const healthRecords = useAppStore((s) => s.healthRecords);

  const alerts = pets
    .map((pet) => {
      const records = healthRecords.filter((r) => r.petId === pet.id);
      let worst: HealthStatus | null = null;
      let worstTitle = '';
      for (const r of records) {
        const st = computeHealthStatus(r);
        if (st === 'overdue' || st === 'due-soon') {
          if (!worst || (st === 'overdue' && worst !== 'overdue')) {
            worst = st;
            worstTitle = r.title;
          }
        }
      }
      return worst ? { pet, status: worst, title: worstTitle } : null;
    })
    .filter((a): a is PetAlert => a !== null)
    .sort((a, b) => (a.status === 'overdue' ? -1 : 0) - (b.status === 'overdue' ? -1 : 0));

  if (alerts.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 px-4 py-2">
      {alerts.map((a) => {
        const overdue = a.status === 'overdue';
        return (
          <button
            key={a.pet.id}
            onClick={() => navigate(`/pet/${a.pet.id}`)}
            className={`animate-fade-up flex w-full items-center justify-between gap-2 rounded-button px-4 py-2.5 text-sm ${
              overdue ? 'bg-danger-bg text-danger' : 'bg-warning-bg text-warning'
            }`}
          >
            <span className="flex min-w-0 items-center gap-2 text-left">
              <span>{a.pet.emoji}</span>
              <span className="truncate">
                {a.pet.name} · {a.title} {overdue ? '已过期' : '即将到期'}
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-0.5">
              去查看 <Icon name="arrowRight" size={14} />
            </span>
          </button>
        );
      })}
    </div>
  );
}
