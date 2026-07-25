import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  User,
  Post,
  Question,
  Pet,
  HealthRecord,
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
  makePost,
  makeQuestion,
} from '@/mock/data';

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

  showToast(message: string): void;
  hideToast(): void;
}

const genId = (): string => 'id_' + Math.random().toString(36).slice(2, 10);
let toastTimer: ReturnType<typeof setTimeout> | null = null;

/** 毛邻全局 Zustand Store（persist 中间件管理 localStorage） */
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
              : p
          ),
        })),

      // —— 发布弹层 ——
      openPublish: (mode) => set({ publishOverlay: { open: true, mode } }),
      closePublish: () => set((s) => ({ publishOverlay: { ...s.publishOverlay, open: false } })),
      addPost: (input) => set((s) => ({ posts: [makePost(input), ...s.posts] })),
      addQuestion: (input) => set((s) => ({ questions: [makeQuestion(input), ...s.questions] })),

      // —— 问答状态流转 ——
      addAnswer: (questionId, input) =>
        set((s) => ({
          questions: s.questions.map((q) =>
            q.id === questionId
              ? {
                  ...q,
                  answers: [
                    ...q.answers,
                    {
                      id: genId(),
                      questionId,
                      authorId: s.currentUser.id,
                      isVet: input.isVet ?? false,
                      content: input.content,
                      likes: 0,
                      isBest: false,
                      createdAt: new Date().toISOString(),
                    },
                  ],
                }
              : q
          ),
        })),
      markBestAnswer: (questionId, answerId) =>
        set((s) => ({
          questions: s.questions.map((q) =>
            q.id === questionId
              ? {
                  ...q,
                  status: 'resolved',
                  answers: q.answers.map((a) => ({ ...a, isBest: a.id === answerId })),
                }
              : q
          ),
        })),
      markUrgent: (questionId) =>
        set((s) => ({
          questions: s.questions.map((q) =>
            q.id === questionId ? { ...q, status: 'urgent' } : q
          ),
        })),
      resolveQuestion: (questionId) =>
        set((s) => ({
          questions: s.questions.map((q) =>
            q.id === questionId ? { ...q, status: 'resolved' } : q
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
          2200
        );
      },
      hideToast: () => set((s) => ({ toast: { ...s.toast, visible: false } })),
    }),
    {
      name: 'maolin-store-v1',
      // 仅持久化用户数据，视图态与 overlay/toast 不入库
      partialize: (s) => ({
        posts: s.posts,
        questions: s.questions,
        pets: s.pets,
        healthRecords: s.healthRecords,
      }),
      // 首次无存储时使用种子数据；有存储则合并覆盖
      merge: (persisted, current) => ({ ...current, ...(persisted as Partial<AppState>) }),
    }
  )
);
