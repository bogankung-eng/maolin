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

// ============ 实体 ============
/** 用户统计 */
export interface UserStats {
  posts: number; // 动态
  fans: number; // 粉丝
  following: number; // 关注
  answers: number; // 回答
}

/** 用户 */
export interface User {
  id: string;
  name: string;
  avatarEmoji: string; // 头像用 emoji（无真实上传）
  city: string; // 城市（mock）
  petYears: number; // 养宠年限
  stats: UserStats;
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
  answers: Answer[];
  status: QaStatus;
  createdAt: string;
}

// ============ 视图辅助 / 输入 ============
/** 发帖输入 */
export interface PostInput {
  content: string;
  petTag: string;
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
