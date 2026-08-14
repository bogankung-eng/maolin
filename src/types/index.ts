// ============ 枚举 ============
/** 帖子 / 问答分类 */
export type Category = 'health' | 'diet' | 'behavior' | 'gear' | 'medical';
/** 问答状态：待解答 / 已解决 / 紧急 */
export type QaStatus = 'open' | 'resolved' | 'urgent';
/** 信息流 Tab：推荐 / 关注 / 同城 */
export type FeedTab = 'recommend' | 'following' | 'local';
/** 健康记录类型 */
export type HealthType = 'vaccine' | 'deworm' | 'weight';
/** 健康状态（派生，不存储）*/
export type HealthStatus = 'normal' | 'due-soon' | 'overdue' | 'none';
/** 发布模式：发帖 / 提问 */
export type PublishMode = 'post' | 'question';
/** 通知类型：被点赞 / 被评论 / 问题被回答 / 健康到期 */
export type NotificationType = 'like' | 'comment' | 'answer' | 'health';
/** 问答状态筛选：全部 / 待解答(open) / 已解决(resolved) / 紧急(urgent) */
export type QaFilter = 'all' | QaStatus;
/** 同城分区：医院 / 约玩 / 宠物店 / 找宠友 */
export type LocalSection = 'hospital' | 'play' | 'shop' | 'friend';
/** 全局搜索分类 Tab */
export type SearchTab = 'all' | 'post' | 'question' | 'user' | 'pet';

// ============ 实体 ============

/** 评论（支持一级回复：parentId 指向父评论） */
export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: string; // ISO
  parentId?: string; // 有值 = 楼中楼一级回复
}

/** 通知 */
export interface Notification {
  id: string;
  type: NotificationType; // 决定 emoji 图标与跳转映射
  message: string; // 完整文案（种子直接给最终文案）
  targetType: 'post' | 'question' | 'pet'; // 跳转目标类型
  targetId: string; // 跳转目标 id
  createdAt: string; // ISO
  read: boolean; // 已读态（持久化）
}
/** 同城条目（纯展示，不持久化，不进 store） */
export interface LocalEntry {
  id: string;
  section: LocalSection;
  city: string;
  title: string;
  subtitle: string;
  emoji: string;
}

/** 用户统计（V3 起 posts/answers/following 不再消费，见 lib/stats.ts 派生计算） */
export interface UserStats {
  /** @deprecated 动态改为按 posts 派生（deriveUserStats） */
  posts: number;
  fans: number; // 粉丝（固定 230，仍被 ProfilePage 读取）
  /** @deprecated 关注改为 followingIds.length 派生 */
  following: number;
  /** @deprecated 回答改为按 answers 派生 */
  answers: number;
}

/** 用户 */
export interface User {
  id: string;
  name: string;
  avatarEmoji: string; // 头像用 emoji（无真实上传）
  city: string; // 城市（mock）
  petYears: number; // 养宠年限
  stats: UserStats;
  followingIds: string[]; // 新增：当前用户关注的人（种子预置 ['u_lin','u_zhou']）
}

/** 宠物 */
export interface Pet {
  id: string;
  ownerId: string;
  name: string;
  species: string; // 品种，如「柯基」
  emoji: string; // 宠物图标，如 🐶
  breedTag: string; // 品种标签文案
  healthReminder?: string; // 健康提醒文案
}

/** 健康记录 */
export interface HealthRecord {
  id: string;
  petId: string;
  type: HealthType;
  title: string; // 如「狂犬疫苗」「体内驱虫」「体重」
  date?: string; // ISO 字符串；weight 可无 date
  value?: string; // 体重类填数值，如「5.2kg」
  // status 为派生值，不存储，渲染时由 computeHealthStatus() 计算
}

/** 帖子 */
export interface Post {
  id: string;
  authorId: string;
  petTag: string; // 宠物标签，如「🐶 豆豆」
  petId?: string; // 新增：关联宠物 id（可选，随 posts 持久化）
  category?: Category;
  content: string;
  images: string[]; // emoji 或 picsum url（可选）
  tags: string[];
  likes: number;
  comments: number;
  shares: number;
  liked: boolean; // 当前用户点赞态
  createdAt: string; // ISO
  source: FeedTab; // 决定出现在哪个 Tab 数据集
}

/** 回答 */
export interface Answer {
  id: string;
  questionId: string;
  authorId: string;
  isVet: boolean; // 兽医标识（绿加粗 ✓）
  content: string;
  likes: number;
  isBest: boolean; // 是否最佳答案
  createdAt: string;
}

/** 问答 */
export interface Question {
  id: string;
  authorId: string;
  category: Category;
  title: string;
  content: string;
  petId?: string; // 新增：提问可选关联宠物
  answers: Answer[];
  status: QaStatus;
  createdAt: string;
}

// ============ 视图辅助 / 输入 ============
/** 发帖输入 */
export interface PostInput {
  content: string;
  petTag: string;
  petId?: string; // 新增：关联宠物 id
  tags: string[];
  images?: string[];
  source: FeedTab;
  category?: Category;
}
/** 提问输入 */
export interface QuestionInput {
  category: Category;
  title: string;
  content: string;
  petId?: string; // 新增：可选关联宠物
}
/** 回答输入 */
export interface AnswerInput {
  content: string;
  isVet?: boolean;
}

// ============ 派生计算 ============
/**
 * 根据健康记录的提醒日期与当前时间，计算健康状态。
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
