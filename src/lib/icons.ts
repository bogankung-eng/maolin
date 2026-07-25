import type { Category } from '@/types';

// ============ 通用 emoji 图标 ============
export const Icons = {
  home: '🏠',
  chat: '💬',
  plus: '＋',
  location: '📍',
  user: '👤',
  search: '🔍',
  heartOutline: '🤍',
  heartFill: '❤️',
  comment: '💬',
  share: '↗',
  vet: '✓',
} as const;

// ============ 分类图标 ============
export const CategoryIcon: Record<Category, string> = {
  health: '💊',
  diet: '🍖',
  behavior: '🎾',
  gear: '🦮',
  medical: '🏥',
};

// ============ 分类中文标签 ============
export const CategoryLabel: Record<Category, string> = {
  health: '健康',
  diet: '饮食',
  behavior: '行为',
  gear: '装备',
  medical: '医疗',
};

// ============ 分类字色 ============
export const CategoryColor: Record<Category, string> = {
  health: 'var(--color-warning)',
  diet: 'var(--color-danger)',
  behavior: 'var(--color-behavior)',
  gear: 'var(--color-gear)',
  medical: 'var(--color-error)',
};

// ============ 分类底色 ============
export const CategoryBg: Record<Category, string> = {
  health: 'var(--color-warning-bg)',
  diet: 'var(--color-danger-bg)',
  behavior: 'var(--color-behavior-bg)',
  gear: 'var(--color-gear-bg)',
  medical: 'var(--color-error-bg)',
};
