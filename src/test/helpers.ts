import { useAppStore } from '@/store/useAppStore';
import {
  currentUser,
  seedPosts,
  seedQuestions,
  seedPets,
  seedHealthRecords,
  seedComments,
  seedNotifications,
} from '@/mock/data';

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

/**
 * 每个测试前重置 store 到干净的种子状态，
 * 并清空 localStorage（persist 中间件会写入），避免用例间串扰。
 */
export function resetStore(): void {
  localStorage.clear();
  useAppStore.setState({
    currentUser: clone(currentUser),
    publishOverlay: { open: false, mode: 'post' },
    toast: { message: '', visible: false },
    posts: clone(seedPosts),
    questions: clone(seedQuestions),
    pets: clone(seedPets),
    healthRecords: clone(seedHealthRecords),
    comments: clone(seedComments),
    notifications: clone(seedNotifications),
    activeTab: 'recommend',
    activeCategory: 'all',
    qaCategory: 'all',
    qaKeyword: '',
  });
}
