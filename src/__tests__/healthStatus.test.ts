import { describe, it, expect } from 'vitest';
import { computeHealthStatus } from '@/lib/health';
import type { HealthRecord } from '@/types';

const DAY = 86400000;

/** 以 base 为「今天」，offsetDays 天后的健康记录（date 为下次提醒日） */
function recAt(
  offsetDays: number,
  base: number,
  type: HealthRecord['type'] = 'vaccine',
): HealthRecord {
  return {
    id: 'x',
    petId: 'p',
    type,
    title: 't',
    date: new Date(base + offsetDays * DAY).toISOString(),
  };
}

describe('computeHealthStatus 健康状态色判定', () => {
  // 以固定基准时间作为「now」，保证边界可复现
  const base = Date.now();

  it('未来 >30 天 -> normal', () => {
    expect(computeHealthStatus(recAt(31, base), new Date(base))).toBe('normal');
  });

  it('未来恰好 30 天 -> due-soon（≤30 天）', () => {
    expect(computeHealthStatus(recAt(30, base), new Date(base))).toBe('due-soon');
  });

  it('未来 29 天 -> due-soon', () => {
    expect(computeHealthStatus(recAt(29, base), new Date(base))).toBe('due-soon');
  });

  it('今天（offset 0）-> due-soon', () => {
    expect(computeHealthStatus(recAt(0, base), new Date(base))).toBe('due-soon');
  });

  it('已超期（昨天，-1 天）-> overdue', () => {
    expect(computeHealthStatus(recAt(-1, base), new Date(base))).toBe('overdue');
  });

  it('已超期（多天前）-> overdue', () => {
    expect(computeHealthStatus(recAt(-15, base), new Date(base))).toBe('overdue');
  });

  it('无 date 且体重类 -> normal', () => {
    const rec: HealthRecord = {
      id: 'h',
      petId: 'p',
      type: 'weight',
      title: '体重',
      value: '4.8kg',
    };
    expect(computeHealthStatus(rec)).toBe('normal');
  });

  it('无 date 且非体重类 -> none', () => {
    const rec: HealthRecord = { id: 'h', petId: 'p', type: 'vaccine', title: '疫苗' };
    expect(computeHealthStatus(rec)).toBe('none');
  });

  it('种子数据 h1(60天后疫苗) -> normal', () => {
    const rec: HealthRecord = {
      id: 'h1',
      petId: 'p1',
      type: 'vaccine',
      title: '狂犬疫苗',
      date: new Date(base + 60 * DAY).toISOString(),
    };
    expect(computeHealthStatus(rec, new Date(base))).toBe('normal');
  });

  it('种子数据 h3(5天前疫苗) -> overdue', () => {
    const rec: HealthRecord = {
      id: 'h3',
      petId: 'p2',
      type: 'vaccine',
      title: '猫三联',
      date: new Date(base - 5 * DAY).toISOString(),
    };
    expect(computeHealthStatus(rec, new Date(base))).toBe('overdue');
  });
});
