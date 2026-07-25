import { RouterProvider } from 'react-router-dom';
import { router } from './router';

// App：聚合路由表，作为 React 根组件
export default function App() {
  return <RouterProvider router={router} />;
}
