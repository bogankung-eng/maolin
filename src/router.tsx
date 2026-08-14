import { createBrowserRouter } from 'react-router-dom';
import { lazy, Suspense, type ReactNode } from 'react';
import { AppShell } from './components/layout/AppShell';
import { PageFallback } from './components/layout/PageFallback';
import { FeedPage } from './pages/FeedPage';
import { QaPage } from './pages/QaPage';
import { ProfilePage } from './pages/ProfilePage';

// 懒加载 6 个二级/新页面（工程 E1）；首屏 3 Tab 页（Feed/Qa/Profile）保持静态 import。
// 页面均为具名导出，需映射为 default 供 React.lazy 使用。
const PostDetailPage = lazy(() => import('./pages/PostDetailPage').then((m) => ({ default: m.PostDetailPage })));
const QaDetailPage = lazy(() => import('./pages/QaDetailPage').then((m) => ({ default: m.QaDetailPage })));
const PetDetailPage = lazy(() => import('./pages/PetDetailPage').then((m) => ({ default: m.PetDetailPage })));
const NotificationPage = lazy(() => import('./pages/NotificationPage').then((m) => ({ default: m.NotificationPage })));
const SearchPage = lazy(() => import('./pages/SearchPage').then((m) => ({ default: m.SearchPage })));
const TopicPage = lazy(() => import('./pages/TopicPage').then((m) => ({ default: m.TopicPage })));

const withSuspense = (node: ReactNode) => (
  <Suspense fallback={<PageFallback />}>{node}</Suspense>
);

// 路由表：底部 5 Tab 走路由，发布弹层走 overlay（不占路由）
export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <FeedPage /> },
      { path: 'feed', element: <FeedPage /> },
      { path: 'qa', element: <QaPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'post/:id', element: withSuspense(<PostDetailPage />) },
      { path: 'qa/:id', element: withSuspense(<QaDetailPage />) },
      { path: 'pet/:id', element: withSuspense(<PetDetailPage />) },
      { path: 'notifications', element: withSuspense(<NotificationPage />) },
      { path: 'search', element: withSuspense(<SearchPage />) },
      { path: 'topic/:tag', element: withSuspense(<TopicPage />) },
    ],
  },
]);
