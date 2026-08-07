import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  User,
  Post,
  Question,
  Pet,
  HealthRecord,
  Comment,
  Notification,
  FeedTab,
  Category,
  PublishMode,
  PostInput,
  QuestionInput,
  AnswerInput,
} from '@/types';
import {
  currentUser,
  seedPosts,
  seedQuestions,
  seedPets,
  seedHealthRecords,
  seedComments,
  seedNotifications,
} from '@/mock/data';
import {
  insertPostSync,
  insertQuestionSync,
  insertAnswerSync,
  insertCommentSync,
} from '@/api';

/** 全局应用状态 */
interface AppState {
  // —— 全局 / 应用态（不持久化）——
  currentUser: User;
  publishOverlay: { open: boolean; mode: PublishMode };
  toast: { message: string; visible: boolean };

  // —— 持久化数据 ——
  posts: Post[];
  questions: Question[];
  pets: Pet[];
  healthRecords: HealthRecord[];
  comments: Comment[]; // V2 新增
  notifications: Notification[]; // V2 新增

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

  showToast(message: string): void;
  hideToast(): void;
}

let toastTimer: ReturnType<typeof setTimeout> | null = null;

/** 毛邻全局 Zustand Store（persist v1：migrate + merge 字段级校验管理 localStorage） */
export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // 初始值（首次无本地存储时使用）
      currentUser,
      publishOverlay: { open: false, mode: 'post' },
      toast: { message: '', visible: false },
      posts: seedPosts,
      questions: seedQuestions,
      pets: seedPets,
      healthRecords: seedHealthRecords,
      comments: seedComments,
      notifications: seedNotifications,
      activeTab: 'recommend',
      activeCategory: 'all',
      qaCategory: 'all',
      qaKeyword: '',

      // —— 视图态 ——
      setActiveTab: (tab) => set({ activeTab: tab }),
      setActiveCategory: (c) => set({ activeCategory: c }),
      setQaCategory: (c) => set({ qaCategory: c }),
      setQaKeyword: (k) => set({ qaKeyword: k }),

      // —— 点赞（即时反馈）——
      toggleLike: (postId) =>
        set((s) => ({
          posts: s.posts.map((p) =>
            p.id === postId
              ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
              : p,
          ),
        })),

      // —— 发布弹层（P0-7：显式依赖 api 层，mock 模式走同步桥保 UI 同步）——
      openPublish: (mode) => set({ publishOverlay: { open: true, mode } }),
      closePublish: () => set((s) => ({ publishOverlay: { ...s.publishOverlay, open: false } })),
      addPost: (input) => set((s) => ({ posts: [insertPostSync(input), ...s.posts] })),
      addQuestion: (input) => set((s) => ({ questions: [insertQuestionSync(input), ...s.questions] })),
      addAnswer: (questionId, input) =>
        set((s) => ({
          questions: s.questions.map((q) =>
            q.id === questionId
              ? {
                  ...q,
                  answers: [
                    ...q.answers,
                    insertAnswerSync(questionId, input, s.currentUser.id),
                  ],
                }
              : q,
          ),
        })),

      // —— 评论（P0-1：前插 + post.comments +1）——
      addComment: (postId, content, parentId?) =>
        set((s) => ({
          comments: [insertCommentSync(postId, content, s.currentUser.id, parentId), ...s.comments],
          posts: s.posts.map((p) => (p.id === postId ? { ...p, comments: p.comments + 1 } : p)),
        })),

      // —— 关注切换（P0-2：不可变更新 followingIds）——
      toggleFollow: (userId) =>
        set((s) => {
          const ids = s.currentUser.followingIds ?? [];
          const followingIds = ids.includes(userId)
            ? ids.filter((id) => id !== userId)
            : [...ids, userId];
          return { currentUser: { ...s.currentUser, followingIds } };
        }),

      // —— 通知全部已读（P0-4）——
      markAllNotificationsRead: () =>
        set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),

      // —— 问答状态流转 ——
      markBestAnswer: (questionId, answerId) =>
        set((s) => ({
          questions: s.questions.map((q) =>
            q.id === questionId
              ? {
                  ...q,
                  status: 'resolved',
                  answers: q.answers.map((a) => ({ ...a, isBest: a.id === answerId })),
                }
              : q,
          ),
        })),
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
      version: 1, // 显式版本号（V1 旧数据无 version 字段 = v0）
      // 仅持久化 7 个数据字段；视图态与 overlay/toast 不入库
      partialize: (s) => ({
        posts: s.posts,
        questions: s.questions,
        pets: s.pets,
        healthRecords: s.healthRecords,
        comments: s.comments,
        notifications: s.notifications,
        currentUser: s.currentUser,
      }),
      // v0 → v1：旧数据缺新字段，用种子默认值补齐（不丢旧数据）。
      // 返回完整 7 字段对象（缺字段回退种子），保证与 partialize 形态一致。
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
          healthRecords: validArr<HealthRecord>(p.healthRecords)
            ? p.healthRecords
            : current.healthRecords,
          comments: validArr<Comment>(p.comments) ? p.comments : current.comments,
          notifications: validArr<Notification>(p.notifications)
            ? p.notifications
            : current.notifications,
          currentUser:
            p.currentUser && Array.isArray(p.currentUser.followingIds)
              ? p.currentUser
              : { ...current.currentUser, followingIds: current.currentUser.followingIds },
        };
      },
    },
  ),
);

/** ID 生成（本地函数，仅供 addPet/addHealthRecord 使用） */
function genId(): string {
  return 'id_' + Math.random().toString(36).slice(2, 10);
}
