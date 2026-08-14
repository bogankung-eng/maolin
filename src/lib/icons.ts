import type { LucideIcon } from 'lucide-react';
import {
  Home,
  MessageCircle,
  Plus,
  MapPin,
  User,
  Search,
  Bell,
  Heart,
  MessageSquare,
  Share2,
  BadgeCheck,
  Lightbulb,
  HeartPulse,
  Bone,
  Activity,
  Shield,
  Stethoscope,
  Hospital,
  Dog,
  Store,
  Handshake,
  ChevronLeft,
  ChevronRight,
  X,
  ArrowRight,
} from 'lucide-react';
import type { Category, NotificationType, LocalSection } from '@/types';

// ============ 通用图标（Lucide 线性图标，key 语义不变） ============
export const Icons = {
  home: Home, // 原 '🏠'
  chat: MessageCircle, // 原 '💬'
  plus: Plus, // 原 '＋'
  location: MapPin, // 原 '📍'
  user: User, // 原 '👤'
  search: Search, // 原 '🔍'
  bell: Bell, // 原 '🔔'
  heartOutline: Heart, // 原 '🤍'（描边）
  heartFill: Heart, // 原 '❤️'（Icon 内部默认 fill=currentColor）
  comment: MessageSquare, // 原 '💬'
  share: Share2, // 原 '↗'
  vet: BadgeCheck, // 原 '✓'
  // —— 新增 4 个（用于散落硬编码符号统一走 <Icon>，既有 key 不变）——
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  x: X,
  arrowRight: ArrowRight,
} as const satisfies Record<string, LucideIcon>;

// ============ 通知类型图标 ============
export const NotificationIcon: Record<NotificationType, LucideIcon> = {
  like: Heart, // 原 '💗'
  comment: MessageSquare, // 原 '💬'
  answer: Lightbulb, // 原 '💡'
  health: HeartPulse, // 原 '🩺'
};

// ============ 分类图标 ============
export const CategoryIcon: Record<Category, LucideIcon> = {
  health: HeartPulse, // 原 '💊'
  diet: Bone, // 原 '🍖'
  behavior: Activity, // 原 '🎾'（裁决：Activity）
  gear: Shield, // 原 '🦮'
  medical: Stethoscope, // 原 '🏥'
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

// ============ 同城分区图标 / 文案 ============
export const LocalSectionIcon: Record<LocalSection, LucideIcon> = {
  hospital: Hospital, // 原 '🏥'
  play: Dog, // 原 '🎾'
  shop: Store, // 原 '🏪'
  friend: Handshake, // 原 '🤝'
};

export const LocalSectionLabel: Record<LocalSection, string> = {
  hospital: '宠物医院',
  play: '约玩',
  shop: '宠物店',
  friend: '找宠友',
};
