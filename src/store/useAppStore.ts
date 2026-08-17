import type {
  AnswerInput,
  Comment,
  FavoriteItem,
  FavoriteType,
  HealthRecord,
  Notification,
  Pet,
  Post,
  PostInput,
  Question,
  QuestionInput,
  ThemeMode,
  User,
  FeedTab,
  Category,
  PublishMode,
} from '@/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  currentUser,
  seedPosts,
  seedQuestions,
  seedPets,
  seedHealthRecords,
  seedComments,
  seedNotifications,
  rollHealthRecordDates,
} from '@/mock/data';
import {
  toggleLikeReducer,
  toggleFollowReducer,
  toggleFavoriteReducer,
  addPostReducer,
  addQuestionReducer,
  addAnswerReducer,
  addCommentReducer,
  incrementShareReducer,
  markAllReadReducer,
  markBestAnswerReducer,
} from '@/store/actions';
import { genId } from '@/lib/id';
import { getStoredTheme, applyTheme, persistTheme } from '@/lib/theme';
import { createDebouncedStorage } from '@/lib/debouncedStorage';

/** 分享弹层视图态（不持久化） */
interface ShareOverlay {
  open: boolean;
  postId: string | null;
}

/** 全局应用状态 */
export interface AppState {
  // —— 全局 / 应用态（不持久化）——
  currentUser: User;
  publishOverlay: { open: boolean; mode: PublishMode };
  toast: { message: string; visible: boolean };
  shareOverlay: ShareOverlay;
  /** 发帖成功引导条（视图态，不持久化） */
  publishGuide: { open: boolean };
  /** 主题三态（独立 key 持久化，不进 persist 主键） */
  theme: ThemeMode;

  // —— 持久化数据 ——
  posts: Post[];
  questions: Question[];
  pets: Pet[];
  healthRecords: HealthRecord[];
  comments: Comment[]; // V2 新增
  notifications: Notification[]; // V2 新增
  favorites: FavoriteItem[]; // V5 新增（收藏/稍后看）

  // —— Feed 视图态（不持久化）——
  activeTab: FeedTab;
  activeCategory: Category | 'all';

  // —— QA 视图态（不持久化）——
  qaCategory: Category | 'all';
  qaKeyword: string;

  // —— Actions ——
  setActiveTab(tab: FeedTab): void;
  setActiveCategory(c: Category | 'all'): void;
  toggleLike(postId: string): void;

  openPublish(mode: PublishMode): void;
  closePublish(): void;
  addPost(input: PostInput): void;
  addQuestion(input: QuestionInput): void;

  /** 打开分享弹层（记录目标帖子） */
  openShare(postId: string): void;
  closeShare(): void;
  /** 分享成功回写 post.shares +1（随 posts 持久化，无需新增键） */
  incrementShare(postId: string): void;

  setQaCategory(c: Category | 'all'): void;
  setQaKeyword(k: string): void;
  addAnswer(questionId: string, input: AnswerInput): void;
  markBestAnswer(questionId: string, answerId: string): void;
  markUrgent(questionId: string): void;
  resolveQuestion(questionId: string): void;

  addPet(input: Omit<Pet, 'id' | 'ownerId'>): void;
  addHealthRecord(input: Omit<HealthRecord, 'id'>): void;

  /** 发表评论 / 一级回复；内部回写 post.comments +1（按条数计，回复也 +1） */
  addComment(postId: string, content: string, parentId?: string): void;
  /** 关注/取关（currentUser.followingIds 增删） */
  toggleFollow(userId: string): void;
  /** 全部通知标记已读（进入通知页时调用） */
  markAllNotificationsRead(): void;

  /** 收藏 / 取消收藏（type: post | question） */
  toggleFavorite(type: FavoriteType, id: string): void;
  /** 发帖成功引导条显隐 */
  showPublishGuide(): void;
  hidePublishGuide(): void;
  /** 切换主题三态并即时应用 + 独立 key 持久化 */
  setTheme(mode: ThemeMode): void;

  showToast(message: string): void;
  hideToast(): void;
}

let toastTimer: ReturnType<typeof setTimeout> | null = null;

/** persist 防抖 storage 实例（导出供测试 resetStore 复位防抖窗口） */
export const persistStorage = createDebouncedStorage(400);

/** 毛邻全局 Zustand Store（persist v1：migrate + merge 字段级校验管理 localStorage） */
export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // 初始值（首次无本地存储时使用）
      currentUser,
      publishOverlay: { open: false, mode: 'post' },
      toast: { message: '', visible: false },
      shareOverlay: { open: false, postId: null },
      publishGuide: { open: false },
      theme: getStoredTheme(),
      posts: seedPosts,
      questions: seedQuestions,
      pets: seedPets,
      healthRecords: seedHealthRecords,
      comments: seedComments,
      notifications: seedNotifications,
      favorites: [],
      activeTab: 'recommend',
      activeCategory: 'all',
      qaCategory: 'all',
      qaKeyword: '',

      // —— 视图态 ——
      setActiveTab: (tab) => set({ activeTab: tab }),
      setActiveCategory: (c) => set({ activeCategory: c }),
      setQaCategory: (c) => set({ qaCategory: c }),
      setQaKeyword: (k) => set({ qaKeyword: k }),

      // —— 点赞（即时反馈，仅替换目标引用，其余保持同引用以配合 memo）——
      toggleLike: (postId) => set((s) => ({ posts: toggleLikeReducer(s.posts, postId) })),

      // —— 发布弹层（显式依赖纯函数 reducer，mock 模式走同步工厂保 UI 同步）——
      openPublish: (mode) => set({ publishOverlay: { open: true, mode } }),
      closePublish: () => set((s) => ({ publishOverlay: { ...s.publishOverlay, open: false } })),
      addPost: (input) => set((s) => ({ posts: addPostReducer(s.posts, input) })),
      addQuestion: (input) => set((s) => ({ questions: addQuestionReducer(s.questions, input) })),
      openShare: (postId) => set({ shareOverlay: { open: true, postId } }),
      closeShare: () => set((s) => ({ shareOverlay: { ...s.shareOverlay, open: false } })),
      incrementShare: (postId) => set((s) => ({ posts: incrementShareReducer(s.posts, postId) })),
      addAnswer: (questionId, input) =>
        set((s) => ({
          questions: addAnswerReducer(s.questions, questionId, input, s.currentUser.id),
        })),

      // —— 评论（前插 + post.comments +1）——
      addComment: (postId, content, parentId?) =>
        set((s) =>
          addCommentReducer(
            { posts: s.posts, comments: s.comments },
            postId,
            content,
            s.currentUser.id,
            parentId,
          ),
        ),

      // —— 关注切换（不可变更新 followingIds）——
      toggleFollow: (userId) =>
        set((s) => ({ currentUser: toggleFollowReducer(s.currentUser, userId) })),

      // —— 通知全部已读 ——
      markAllNotificationsRead: () =>
        set((s) => ({ notifications: markAllReadReducer(s.notifications) })),

      // —— 问答状态流转 ——
      markBestAnswer: (questionId, answerId) =>
        set((s) => ({ questions: markBestAnswerReducer(s.questions, questionId, answerId) })),
      markUrgent: (questionId) =>
        set((s) => ({
          questions: s.questions.map((q) => (q.id === questionId ? { ...q, status: 'urgent' } : q)),
        })),
      resolveQuestion: (questionId) =>
        set((s) => ({
          questions: s.questions.map((q) =>
            q.id === questionId ? { ...q, status: 'resolved' } : q,
          ),
        })),

      // —— 宠物 / 健康记录 ——
      addPet: (input) =>
        set((s) => ({ pets: [...s.pets, { ...input, id: genId(), ownerId: s.currentUser.id }] })),
      addHealthRecord: (input) =>
        set((s) => ({ healthRecords: [...s.healthRecords, { ...input, id: genId() }] })),

      // —— 收藏 ——
      toggleFavorite: (type, id) =>
        set((s) => ({ favorites: toggleFavoriteReducer(s.favorites, type, id) })),

      // —— 发帖引导条（不进 persist）——
      showPublishGuide: () => set({ publishGuide: { open: true } }),
      hidePublishGuide: () => set({ publishGuide: { open: false } }),

      // —— 主题三态 ——
      setTheme: (mode) => {
        applyTheme(mode);
        persistTheme(mode);
        set({ theme: mode });
      },

      // —— Toast ——
      showToast: (message) => {
        if (toastTimer) clearTimeout(toastTimer);
        set({ toast: { message, visible: true } });
        toastTimer = setTimeout(
          () => set((s) => ({ toast: { ...s.toast, visible: false } })),
          2200,
        );
      },
      hideToast: () => set((s) => ({ toast: { ...s.toast, visible: false } })),
    }),
    {
      name: 'maolin-store-v1',
      version: 1, // 保持 v1 不 bump（favorites 靠 merge 字段级校验兜底，缺失回退 []）
      storage: persistStorage,
      // 仅持久化 8 个数据字段；视图态与 overlay/toast/publishGuide/theme 不入库
      partialize: (s) => ({
        posts: s.posts,
        questions: s.questions,
        pets: s.pets,
        healthRecords: s.healthRecords,
        comments: s.comments,
        notifications: s.notifications,
        currentUser: s.currentUser,
        favorites: s.favorites,
      }),
      // v0 → v1：旧数据缺新字段，用种子默认值补齐（不丢旧数据）。
      migrate: (persisted, _version) => {
        const p = (persisted ?? {}) as Partial<AppState>;
        return {
          posts: Array.isArray(p.posts) ? p.posts : seedPosts,
          questions: Array.isArray(p.questions) ? p.questions : seedQuestions,
          pets: Array.isArray(p.pets) ? p.pets : seedPets,
          healthRecords: Array.isArray(p.healthRecords) ? p.healthRecords : seedHealthRecords,
          comments: Array.isArray(p.comments) ? p.comments : seedComments,
          notifications: Array.isArray(p.notifications) ? p.notifications : seedNotifications,
          currentUser:
            p.currentUser && Array.isArray(p.currentUser.followingIds)
              ? p.currentUser
              : currentUser,
          favorites: Array.isArray(p.favorites) ? p.favorites : [],
        };
      },
      // 字段级校验：非法值回退种子，绝不抛错、绝不丢健康字段
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<AppState>;
        const validArr = <T,>(v: unknown): v is T[] => Array.isArray(v);
        return {
          ...current,
          posts: validArr<Post>(p.posts) ? p.posts : current.posts,
          questions: validArr<Question>(p.questions) ? p.questions : current.questions,
          pets: validArr<Pet>(p.pets) ? p.pets : current.pets,
          healthRecords: rollHealthRecordDates(
            validArr<HealthRecord>(p.healthRecords) ? p.healthRecords : current.healthRecords,
          ),
          comments: validArr<Comment>(p.comments) ? p.comments : current.comments,
          notifications: validArr<Notification>(p.notifications)
            ? p.notifications
            : current.notifications,
          currentUser:
            p.currentUser && Array.isArray(p.currentUser.followingIds)
              ? p.currentUser
              : { ...current.currentUser, followingIds: current.currentUser.followingIds },
          favorites: validArr<FavoriteItem>(p.favorites) ? p.favorites : current.favorites,
        };
      },
    },
  ),
);
