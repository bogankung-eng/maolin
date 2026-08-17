import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { useAppStore } from '@/store/useAppStore';
import { applyTheme } from '@/lib/theme';
import { initStorageSync } from '@/lib/storageSync';

// 应用入口：挂载 React 根节点。
// 先于 render 应用主题（避免深色 FOUC）+ 初始化多标签 storage 同步。
applyTheme(useAppStore.getState().theme);
initStorageSync();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
