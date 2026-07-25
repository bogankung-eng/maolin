import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { FeedPage } from './pages/FeedPage';
import { QaPage } from './pages/QaPage';
import { ProfilePage } from './pages/ProfilePage';
import { PostDetailPage } from './pages/PostDetailPage';
import { QaDetailPage } from './pages/QaDetailPage';

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
      { path: 'post/:id', element: <PostDetailPage /> },
      { path: 'qa/:id', element: <QaDetailPage /> },
    ],
  },
]);
