import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { HealthRecordList } from '@/components/profile/HealthRecordList';
import { PostCard } from '@/components/feed/PostCard';
import { Icon } from '@/components/common/Icon';
import { EmptyState } from '@/components/common/EmptyState';
import { computeHealthStatus } from '@/types';
import { formatDate } from '@/lib/mockApi';
import type { HealthType } from '@/types';

const GROUP_META: { key: HealthType; label: string }[] = [
  { key: 'vaccine', label: '疫苗' },
  { key: 'deworm', label: '驱虫' },
  { key: 'weight', label: '体重' },
];

/**
 * 宠物详情页（P0-3）：
 * 宠物头部（emoji 52 radius14 绿底 / 名称 / 品种 pill / 健康提醒文案）；
 * 健康记录仅该宠按 疫苗/驱虫/体重 分组（状态色沿用 HealthRecordList）；
 * 成长信息（健康记录数 / 相关帖子数 / 体重列表）；
 * 相关帖子聚合（petTag 包含宠物名或 emoji）；不存在宠物 → 空态。
 */
export function PetDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const pet = useAppStore((s) => s.pets.find((p) => p.id === id));
  const healthRecords = useAppStore((s) => s.healthRecords);
  const posts = useAppStore((s) => s.posts);

  const petRecords = useMemo(
    () => healthRecords.filter((r) => r.petId === id),
    [healthRecords, id],
  );

  const relatedPosts = useMemo(
    () =>
      pet
        ? posts.filter((p) => p.petTag.includes(pet.name) || p.petTag.includes(pet.emoji))
        : [],
    [posts, pet],
  );

  if (!pet) {
    return (
      <EmptyState
        title="宠物不存在"
        action={
          <button
            onClick={() => navigate(-1)}
            className="rounded-button bg-brand px-4 py-2 text-sm text-white"
          >
            返回
          </button>
        }
      />
    );
  }

  // 健康提醒文案：优先 pet.healthReminder，否则按该宠异常记录生成
  const abnormal = petRecords
    .map((r) => ({ record: r, status: computeHealthStatus(r) }))
    .filter((x) => x.status === 'overdue' || x.status === 'due-soon');
  const worstAbnormal = abnormal.find((x) => x.status === 'overdue') ?? abnormal[0];
  const reminderText =
    pet.healthReminder ||
    (worstAbnormal
      ? `${worstAbnormal.record.title} ${worstAbnormal.status === 'overdue' ? '已过期' : '即将到期'}`
      : '');

  const weightRecords = petRecords.filter((r) => r.type === 'weight');

  return (
    <div className="min-h-full bg-surface">
      {/* 顶部返回栏 */}
      <header className="sticky top-0 z-10 flex h-[52px] items-center border-b border-border bg-surface px-4">
        <button
          onClick={() => navigate(-1)}
          className="mr-3 text-text-secondary"
          aria-label="返回"
        >
          <Icon name="chevronLeft" size={20} />
        </button>
        <span className="text-base font-semibold text-text">宠物详情</span>
      </header>

      {/* 宠物头部 */}
      <div className="flex items-center gap-3 px-4 pt-4">
        <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-pet bg-brand-light text-3xl">
          {pet.emoji}
        </div>
        <div className="flex min-w-0 flex-col">
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold text-text">{pet.name}</span>
            <span className="rounded-pill bg-brand-light px-2 py-0.5 text-xs text-brand">
              {pet.breedTag}
            </span>
          </div>
          {reminderText && (
            <span className="mt-1 truncate text-xs text-text-secondary">{reminderText}</span>
          )}
        </div>
      </div>

      {/* 健康记录（仅该宠，按类型分组） */}
      <section className="mt-6 px-4">
        <h2 className="mb-2 text-sm font-semibold text-text">健康记录</h2>
        {petRecords.length === 0 ? (
          <div className="text-sm text-text-tertiary">暂无健康记录</div>
        ) : (
          GROUP_META.map((g) => {
            const group = petRecords.filter((r) => r.type === g.key);
            if (group.length === 0) return null;
            return (
              <div key={g.key} className="mt-4">
                <h3 className="mb-2 text-xs font-semibold text-text-secondary">{g.label}</h3>
                <HealthRecordList records={group} />
              </div>
            );
          })
        )}
      </section>

      {/* 成长信息（派生统计 + 体重列表） */}
      <section className="mt-6 px-4">
        <h2 className="mb-2 text-sm font-semibold text-text">成长信息</h2>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-pill bg-brand-light px-3 py-1 text-xs text-brand-dark">
            {petRecords.length} 条健康记录
          </span>
          <span className="rounded-pill bg-brand-light px-3 py-1 text-xs text-brand-dark">
            {relatedPosts.length} 条相关动态
          </span>
        </div>
        {weightRecords.length > 0 && (
          <div className="mt-3 flex flex-col gap-2">
            {weightRecords.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between rounded-button border border-border bg-bg px-3 py-2"
              >
                <span className="text-sm text-text">{r.value ?? r.title}</span>
                {r.date && (
                  <span className="text-xs text-text-tertiary">{formatDate(r.date)}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 相关帖子（复用 PostCard） */}
      <section className="mt-6">
        <h2 className="mb-2 px-4 text-sm font-semibold text-text">相关动态</h2>
        {relatedPosts.length === 0 ? (
          <EmptyState title="还没有 TA 的动态" />
        ) : (
          <div className="pb-8">
            {relatedPosts.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
