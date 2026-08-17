import type {
  User,
  Pet,
  Post,
  Question,
  HealthRecord,
  Comment,
  Notification,
  PostInput,
  QuestionInput,
  LocalEntry,
} from '@/types';
import { genId } from '@/lib/id';
import { buildUserMap, type UserMap } from '@/lib/userMap';

// ============ 当前用户（固定 mock，本期无登录注册） ============
export const currentUser: User = {
  id: 'u_me',
  name: '阿豆',
  avatarEmoji: '🦊',
  city: '杭州',
  petYears: 3,
  stats: { posts: 12, fans: 230, following: 80, answers: 18 },
  followingIds: ['u_lin', 'u_zhou'], // V2：种子预置已关注 2 人
};

// ============ 其他 mock 用户（用于种子帖子 / 问答作者解析） ============
const u_lin: User = {
  id: 'u_lin',
  name: '林小宠',
  avatarEmoji: '🐱',
  city: '上海',
  petYears: 5,
  stats: { posts: 40, fans: 1200, following: 200, answers: 60 },
  followingIds: [],
};
const u_zhou: User = {
  id: 'u_zhou',
  name: '周兽医',
  avatarEmoji: '🐶',
  city: '北京',
  petYears: 8,
  stats: { posts: 30, fans: 3000, following: 50, answers: 200 },
  followingIds: [],
};
const u_chen: User = {
  id: 'u_chen',
  name: '陈泡泡',
  avatarEmoji: '🐰',
  city: '广州',
  petYears: 2,
  stats: { posts: 15, fans: 300, following: 120, answers: 5 },
  followingIds: [],
};

/** 全部用户集合，供 getUserById / buildUserMap 解析作者 */
export const users: User[] = [currentUser, u_lin, u_zhou, u_chen];

/** 用户 id -> User 的 O(1) 索引（工程 E9） */
export const userMap: UserMap = buildUserMap(users);

/** 根据 id 解析用户，未命中回退到当前用户（O(1)） */
export function getUserById(id: string): User {
  return userMap[id] ?? currentUser;
}

// ============ 种子宠物 ============
export const seedPets: Pet[] = [
  {
    id: 'p1',
    ownerId: currentUser.id,
    name: '豆豆',
    species: '柯基',
    emoji: '🐶',
    breedTag: '柯基',
    healthReminder: '狂犬疫苗将于近期到期',
  },
  {
    id: 'p2',
    ownerId: currentUser.id,
    name: '咪咪',
    species: '英短',
    emoji: '🐱',
    breedTag: '英国短毛猫',
    healthReminder: '体内驱虫提醒',
  },
  {
    id: 'p3',
    ownerId: currentUser.id,
    name: '球球',
    species: '布偶',
    emoji: '🐱',
    breedTag: '布偶猫',
  },
];

// ============ 种子健康记录（覆盖 normal / due-soon / overdue / none） ============
const NOW = new Date();
const DAY = 86400000;
const daysAgo = (d: number): string => new Date(NOW.getTime() - d * DAY).toISOString();

/** seed id → 相对天数偏移（正=未来到期、负=已超期、null=无日期） */
const HEALTH_SEED_OFFSET: Record<string, number | null> = {
  h1: 60, // >30 天 -> normal
  h2: 10, // ≤30 天 -> due-soon
  h3: -5, // 已超期 -> overdue
  h4: null, // 无日期体重 -> normal
  h5: null, // 无日期非体重 -> none
};

/** 基础健康记录（date 为占位，由 rollHealthRecordDates 重锚定） */
const baseHealthRecords: HealthRecord[] = [
  { id: 'h1', petId: 'p1', type: 'vaccine', title: '狂犬疫苗', date: undefined },
  { id: 'h2', petId: 'p1', type: 'deworm', title: '体内驱虫', date: undefined },
  { id: 'h3', petId: 'p2', type: 'vaccine', title: '猫三联', date: undefined },
  { id: 'h4', petId: 'p2', type: 'weight', title: '体重记录', value: '4.8kg' },
  { id: 'h5', petId: 'p3', type: 'vaccine', title: '年度体检', date: undefined },
];

/**
 * 按当前时间重锚定种子日期；非 seed id 记录原样保留。
 * 保证 normal / due-soon / overdue / none 四种演示状态永远稳定（工程 E6）。
 */
export function rollHealthRecordDates(records: HealthRecord[]): HealthRecord[] {
  const now = Date.now();
  return records.map((r) => {
    const off = HEALTH_SEED_OFFSET[r.id];
    if (off === undefined || off === null) return r;
    return { ...r, date: new Date(now + off * DAY).toISOString() };
  });
}

export const seedHealthRecords: HealthRecord[] = rollHealthRecordDates(baseHealthRecords);

// ============ 热门话题标签（发帖多选来源 + 话题页/搜索聚合） ============
export const hotTags: string[] = [
  '日常', '训练', '测评', '同城', '聚会', '分享', '庆祝',
  '疫苗', '饮食', '行为', '装备', '医疗', '健康',
];

/** mock 城市列表（同城 LBS 城市选择器，不调 geolocation） */
export const CITIES: string[] = ['杭州', '上海', '北京', '广州', '深圳'];

/** 同城种子条目（4 分区 × 多城市，默认城市杭州每区 ≥2 条） */
export const seedLocalEntries: LocalEntry[] = [
  { id: 'l1', section: 'hospital', city: '杭州', title: '安心宠物医院', subtitle: '距你 1.2km · 24 小时急诊', emoji: '🏥' },
  { id: 'l2', section: 'hospital', city: '上海', title: '仁心动物医院', subtitle: '三甲兽医坐诊', emoji: '🏥' },
  { id: 'l3', section: 'play', city: '杭州', title: '西湖遛狗团', subtitle: '周六 9:00 · 已 12 人', emoji: '🎾' },
  { id: 'l4', section: 'shop', city: '杭州', title: '喵星球宠物店', subtitle: '洗澡美容 8 折', emoji: '🏪' },
  { id: 'l5', section: 'friend', city: '杭州', title: '柯基家长群', subtitle: '同品种找玩伴', emoji: '🤝' },
  { id: 'l6', section: 'friend', city: '北京', title: '英短猫友会', subtitle: '北京朝阳区', emoji: '🤝' },
  // —— 补齐默认城市（杭州）每分区 ≥2 条 ——
  { id: 'l7', section: 'hospital', city: '杭州', title: '康宁宠物诊所', subtitle: '疫苗体检预约中', emoji: '🏥' },
  { id: 'l8', section: 'play', city: '杭州', title: '滨江狗狗公园', subtitle: '周日 15:00 · 已 8 人', emoji: '🎾' },
  { id: 'l9', section: 'shop', city: '杭州', title: '爪爪生活馆', subtitle: '零食玩具满减', emoji: '🏪' },
  { id: 'l10', section: 'friend', city: '杭州', title: '柴犬家长群', subtitle: '同品种找玩伴', emoji: '🤝' },
];

// ============ 种子帖子（覆盖 recommend / following / local 三种 source） ============
export const seedPosts: Post[] = [
  {
    id: 'post_1',
    authorId: 'u_lin',
    petTag: '🐱 奶糖',
    category: 'health',
    content: '柯基宝宝打完疫苗后有点蔫，正常吗？大家都是怎么照顾刚接种的小家伙的～',
    images: ['🐶'],
    tags: ['疫苗', '健康'],
    likes: 128,
    comments: 23,
    shares: 4,
    liked: false,
    createdAt: daysAgo(1).toString(),
    source: 'recommend',
  },
  {
    id: 'post_2',
    authorId: 'u_chen',
    petTag: '🐰 团子',
    category: 'diet',
    content: '自制兔粮分享！科学配比才能让毛孩子吃得香又健康，附上今天的成果图～',
    images: ['https://picsum.photos/seed/maolin2/400/200'],
    tags: ['饮食', '分享'],
    likes: 89,
    comments: 12,
    shares: 9,
    liked: true,
    createdAt: daysAgo(2).toString(),
    source: 'recommend',
  },
  {
    id: 'post_3',
    authorId: 'u_zhou',
    petTag: '🐶 大白',
    category: 'behavior',
    content: '训练狗狗定点排便的 3 个关键技巧，亲测有效，新手铲屎官必看！',
    images: ['🎾'],
    tags: ['行为', '训练'],
    likes: 256,
    comments: 41,
    shares: 30,
    liked: false,
    createdAt: daysAgo(3).toString(),
    source: 'following',
  },
  {
    id: 'post_4',
    authorId: 'u_lin',
    petTag: '🐱 奶糖',
    category: 'gear',
    content: '新入手的猫爬架测评，性价比超高，毛孩子玩得不亦乐乎～',
    images: ['🦮'],
    tags: ['装备', '测评'],
    likes: 64,
    comments: 8,
    shares: 2,
    liked: false,
    createdAt: daysAgo(4).toString(),
    source: 'following',
  },
  {
    id: 'post_5',
    authorId: 'u_chen',
    petTag: '🐰 团子',
    category: 'medical',
    content: '同城宠物医院推荐！环境干净、医生耐心，坐标广州天河区～',
    images: ['🏥'],
    tags: ['医疗', '同城'],
    likes: 45,
    comments: 15,
    shares: 6,
    liked: false,
    createdAt: daysAgo(1).toString(),
    source: 'local',
  },
  {
    id: 'post_6',
    authorId: 'u_me',
    petTag: '🐶 豆豆',
    category: 'health',
    content: '豆豆今天满三岁啦！记录一下它的成长，感谢毛邻社区的陪伴🎉',
    images: ['🐶', '🎂'],
    tags: ['日常', '庆祝'],
    likes: 320,
    comments: 56,
    shares: 18,
    liked: false,
    createdAt: daysAgo(2).toString(),
    source: 'recommend',
  },
  {
    id: 'post_7',
    authorId: 'u_lin',
    petTag: '🐱 奶糖',
    category: 'diet',
    content: '同城猫友线下聚会报名中！一起交流科学喂养经验～',
    images: ['🍖'],
    tags: ['同城', '聚会'],
    likes: 33,
    comments: 9,
    shares: 3,
    liked: false,
    createdAt: daysAgo(5).toString(),
    source: 'local',
  },
];

// ============ 种子问答（覆盖 5 类 + open / resolved / urgent） ============
export const seedQuestions: Question[] = [
  {
    id: 'q1',
    authorId: 'u_chen',
    category: 'health',
    title: '狗狗打完疫苗后食欲不振怎么办？',
    content: '豆豆打完疫苗第二天不太吃东西，精神还可以，需要去医院吗？',
    status: 'open',
    createdAt: daysAgo(1).toString(),
    answers: [
      {
        id: 'a1',
        questionId: 'q1',
        authorId: 'u_zhou',
        isVet: true,
        content:
          '疫苗后 1-2 天食欲略降属正常反应，保证饮水、清淡饮食即可，若超过 48 小时仍不吃建议就诊。',
        likes: 42,
        isBest: false,
        createdAt: daysAgo(1).toString(),
      },
    ],
  },
  {
    id: 'q2',
    authorId: 'u_lin',
    category: 'diet',
    title: '幼猫一天喂几次比较合适？',
    content: '三个月大的英短，目前一天三顿，体重增长正常吗？',
    status: 'resolved',
    createdAt: daysAgo(3).toString(),
    answers: [
      {
        id: 'a2',
        questionId: 'q2',
        authorId: 'u_zhou',
        isVet: true,
        content: '3 月龄幼猫建议一天 3-4 次少量多餐，体重稳步增长即正常，注意选幼猫粮。',
        likes: 18,
        isBest: true,
        createdAt: daysAgo(3).toString(),
      },
      {
        id: 'a3',
        questionId: 'q2',
        authorId: 'u_chen',
        isVet: false,
        content: '我家也是一天三顿，长得很壮实，按这个节奏就行～',
        likes: 5,
        isBest: false,
        createdAt: daysAgo(2).toString(),
      },
    ],
  },
  {
    id: 'q3',
    authorId: 'u_me',
    category: 'behavior',
    title: '猫咪半夜跑酷怎么破？急！',
    content: '咪咪每天凌晨三点准时开运动会，已经严重影响睡眠了，求支招！',
    status: 'urgent',
    createdAt: daysAgo(0).toString(),
    answers: [
      {
        id: 'a4',
        questionId: 'q3',
        authorId: 'u_lin',
        isVet: false,
        content: '睡前用逗猫棒陪玩 15 分钟消耗精力，关灯后别理它，坚持几天会好转。',
        likes: 9,
        isBest: false,
        createdAt: daysAgo(0).toString(),
      },
    ],
  },
  {
    id: 'q4',
    authorId: 'u_chen',
    category: 'gear',
    title: '有没有好用的自动饮水机推荐？',
    content: '想给兔子换个大容量静音饮水机，预算 100 以内。',
    status: 'open',
    createdAt: daysAgo(2).toString(),
    answers: [],
  },
  {
    id: 'q5',
    authorId: 'u_lin',
    category: 'medical',
    title: '宠物绝育的最佳年龄是多大？',
    content: '英短妹妹快半岁了，医生说是时候安排绝育，想了解下风险。',
    status: 'open',
    createdAt: daysAgo(4).toString(),
    answers: [
      {
        id: 'a5',
        questionId: 'q5',
        authorId: 'u_zhou',
        isVet: true,
        content: '猫建议 6 个月左右，狗视体型 6-12 月，正规麻醉下风险很低，利大于弊。',
        likes: 27,
        isBest: false,
        createdAt: daysAgo(3).toString(),
      },
    ],
  },
];

// ============ 种子评论（覆盖 post_1/post_2/post_6，含 1 条楼中楼一级回复） ============
export const seedComments: Comment[] = [
  {
    id: 'c1',
    postId: 'post_1',
    authorId: 'u_chen',
    content: '打完疫苗蔫一天很正常，多陪陪它、注意保暖就好～',
    createdAt: daysAgo(1).toString(),
  },
  {
    id: 'c2',
    postId: 'post_1',
    authorId: 'u_zhou',
    content: '补充：48 小时内食欲恢复就不用太担心，超过就去医院看看。',
    parentId: 'c1', // 楼中楼一级回复样例
    createdAt: daysAgo(1).toString(),
  },
  {
    id: 'c3',
    postId: 'post_2',
    authorId: 'u_lin',
    content: '兔粮配方太专业了，收藏！下次也试试这个比例～',
    createdAt: daysAgo(2).toString(),
  },
  {
    id: 'c4',
    postId: 'post_6',
    authorId: 'u_lin',
    content: '豆豆生日快乐！🎉 三岁的小伙子啦～',
    createdAt: daysAgo(2).toString(),
  },
];

// ============ 种子通知（4 类各 ≥1 条，read/unread 混合，target 指向真实实体 post_6/q3/p2） ============
export const seedNotifications: Notification[] = [
  {
    id: 'n1',
    type: 'like',
    message: '林小宠 赞了你的动态',
    targetType: 'post',
    targetId: 'post_6',
    createdAt: daysAgo(1).toString(),
    read: false,
  },
  {
    id: 'n2',
    type: 'comment',
    message: '陈泡泡 评论了你的动态',
    targetType: 'post',
    targetId: 'post_6',
    createdAt: daysAgo(2).toString(),
    read: false,
  },
  {
    id: 'n3',
    type: 'answer',
    message: '周兽医 回答了你的问题',
    targetType: 'question',
    targetId: 'q3',
    createdAt: daysAgo(3).toString(),
    read: true,
  },
  {
    id: 'n4',
    type: 'health',
    message: '咪咪的 猫三联 已过期，请及时安排',
    targetType: 'pet',
    targetId: 'p2',
    createdAt: daysAgo(4).toString(),
    read: false,
  },
];

// ============ 工厂函数（供 store action 复用） ============
/** 生成一条帖子实体（带 id / 时间） */
export function makePost(input: PostInput): Post {
  return {
    id: genId(),
    authorId: currentUser.id,
    petTag: input.petTag,
    petId: input.petId,
    category: input.category,
    content: input.content,
    images: input.images ?? [],
    tags: input.tags,
    likes: 0,
    comments: 0,
    shares: 0,
    liked: false,
    createdAt: new Date().toISOString(),
    source: input.source,
  };
}

/** 生成一条问答实体（带 id / 时间） */
export function makeQuestion(input: QuestionInput): Question {
  return {
    id: genId(),
    authorId: currentUser.id,
    category: input.category,
    title: input.title,
    content: input.content,
    petId: input.petId,
    answers: [],
    status: 'open',
    createdAt: new Date().toISOString(),
  };
}

/** 生成一条评论 / 一级回复实体（带 id / 时间，authorId 默认当前用户） */
export function makeComment(
  postId: string,
  content: string,
  authorId: string = currentUser.id,
  parentId?: string,
): Comment {
  return {
    id: genId(),
    postId,
    authorId,
    content,
    createdAt: new Date().toISOString(),
    parentId,
  };
}

/** 生成一条通知实体（带 id / 时间 / 未读，其余字段由输入决定） */
export function makeNotification(input: Omit<Notification, 'id' | 'createdAt' | 'read'>): Notification {
  return {
    id: genId(),
    ...input,
    createdAt: new Date().toISOString(),
    read: false,
  };
}
