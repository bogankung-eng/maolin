import { describe, it, expect } from 'vitest';
import { genId } from '@/lib/id';
import { computeHealthStatus } from '@/lib/health';
import type { HealthRecord } from '@/types';

describe('ID 收敛（E4）', () => {
  it('genId 返回 id_ + 8 位 base36 格式', () => {
    const id = genId();
    expect(id).toMatch(/^id_[0-9a-z]{8}$/);
  });

  it('genId 多次调用不重复（高概率）', () => {
    const ids = new Set(Array.from({ length: 100 }, () => genId()));
    expect(ids.size).toBe(100);
  });
});

describe('computeHealthStatus 迁移后行为（E3，与 V4 原实现一致）', () => {
  const rec = (over: Partial<HealthRecord>): HealthRecord => ({
    id: 'x',
    petId: 'p1',
    type: 'vaccine',
    title: 't',
    ...over,
  });
  const now = new Date('2026-01-01T00:00:00Z');

  it('四态边界（31 天 normal / 30 天 due-soon / 超期 overdue / 无日期）', () => {
    expect(computeHealthStatus(rec({ date: '2026-02-01T00:00:00Z' }), now)).toBe('normal'); // 31 天
    expect(computeHealthStatus(rec({ date: '2026-01-31T00:00:00Z' }), now)).toBe('due-soon'); // 30 天
    expect(computeHealthStatus(rec({ date: '2025-12-31T00:00:00Z' }), now)).toBe('overdue'); // -1 天
    expect(computeHealthStatus(rec({ type: 'weight', date: undefined }), now)).toBe('normal'); // 体重无日期
    expect(computeHealthStatus(rec({ type: 'vaccine', date: undefined }), now)).toBe('none'); // 非体重无日期
  });
});
