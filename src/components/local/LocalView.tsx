import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { CityPicker } from './CityPicker';
import { seedLocalEntries, seedPosts, getUserById } from '@/mock/data';
import { LocalSectionIcon, LocalSectionLabel } from '@/lib/icons';
import type { LocalSection, LocalEntry, Post } from '@/types';

const SECTIONS: LocalSection[] = ['hospital', 'play', 'shop', 'friend'];

/**
 * 将 source==='local' 的种子帖映射到对应同城分区（PRD：现有 local 帖并入分区，不丢数据）。
 * 分区依据内容关键词 + 分类：医院/诊所 → hospital，聚会/约玩 → play，宠物店/美容 → shop，其余 → friend。
 */
function localPostSection(post: Post): LocalSection {
  const text = `${post.content} ${post.tags.join(' ')}`;
  if (/医院|诊所|疫苗/.test(text) || post.category === 'medical') return 'hospital';
  if (/聚会|约玩|遛狗|公园/.test(text)) return 'play';
  if (/宠物店|美容|洗澡|店/.test(text)) return 'shop';
  return 'friend';
}

/** 同城 LBS（F7）：城市选择器 + 4 分区卡片列表；合并种子条目与 local 帖子，不调 geolocation */
export function LocalView() {
  const currentUser = useAppStore((s) => s.currentUser);
  const [city, setCity] = useState(currentUser.city);

  // 种子 local 帖子并入分区：城市取作者所在城市，映射到对应分区（不丢数据）
  const localPostEntries: LocalEntry[] = seedPosts
    .filter((p) => p.source === 'local')
    .map((p) => ({
      id: p.id,
      section: localPostSection(p),
      city: getUserById(p.authorId).city,
      title: p.content,
      subtitle: `${p.petTag} · ${getUserById(p.authorId).name}`,
      emoji: p.images[0] ?? '📍',
    }));

  const entries = [...seedLocalEntries, ...localPostEntries].filter((e) => e.city === city);

  return (
    <div className="px-4 py-3">
      <CityPicker value={city} onChange={setCity} />

      {SECTIONS.map((section) => {
        const items = entries.filter((e) => e.section === section);
        const SectionIcon = LocalSectionIcon[section];
        return (
          <section key={section} className="mt-4">
            <h2 className="mb-2 flex items-center gap-1 text-sm font-semibold text-text">
              <SectionIcon size={18} />
              {LocalSectionLabel[section]}
            </h2>
            {items.length === 0 ? (
              <div className="rounded-button bg-surface py-6 text-center text-xs text-text-tertiary">
                该城市暂无{LocalSectionLabel[section]}信息
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 rounded-button border border-border bg-surface p-3"
                  >
                    <span className="text-2xl">{item.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-text">{item.title}</div>
                      <div className="mt-0.5 text-xs text-text-secondary">{item.subtitle}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
