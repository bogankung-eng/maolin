import type { HealthRecord, HealthStatus } from '@/types';

/**
 * 根据健康记录的提醒日期与当前时间，计算健康状态（工程 E3，自 @/types 迁出）。
 * - 无日期：体重类视为 normal，其余视为 none
 * - 已超期（date 早于 now）：overdue
 * - 30 天内到期（含今天）：due-soon
 * - 超过 30 天：normal
 */
export function computeHealthStatus(rec: HealthRecord, now: Date = new Date()): HealthStatus {
  if (!rec.date) return rec.type === 'weight' ? 'normal' : 'none';
  const diffDays = Math.floor((new Date(rec.date).getTime() - now.getTime()) / 86400000);
  if (diffDays < 0) return 'overdue'; // 已超期
  if (diffDays <= 30) return 'due-soon'; // 30 天内到期
  return 'normal'; // 超过 30 天正常
}
