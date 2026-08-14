# 毛邻

> 毛孩子邻里社区 — 宠物社交 + 健康管理

---

## 技术栈

| 类别 | 选型 |
|---|---|
| 框架 | Vite + React 18 |
| 路由 | React Router v6（懒加载 + Suspense） |
| 状态 | Zustand（persist v1） |
| 样式 | Tailwind CSS 3 + TypeScript + 字体 self-host |
| 测试 | Vitest + Testing Library |
| 工具 | Prettier + ESLint 9 (flat config) |

## 功能

| 模块 | 说明 |
|---|---|
| 信息流 | 宠物动态 Feed + 分类筛选 + 同城分区聚合 |
| 问答 | 社区问答（Q&A）+ 标题/详情双输入 |
| 发布 | 图文发布（关联宠物 + 多图上传 + 标签） |
| 搜索 | 全局搜索帖子 / 问答 / 用户 / 宠物 |
| 话题 | #tag 可点 → /topic/:tag 聚合 |
| 分享 | 分享面板（复制链接 + 系统分享） |
| 个人 | 宠物档案 + 健康记录 + 统计真实化 |
| 详情 | 帖子 / 问答 / 宠物详情页 |

## 本地开发

```bash
npm install
npm run dev        # → Vite 开发服务器
npm run test       # Vitest 单测
npm run lint       # ESLint
npm run format     # Prettier 格式化
npm run build      # tsc + vite build
```

## 部署（SPA fallback）

本项目为纯前端 SPA，直接访问深层路由（如 `/post/post_1`、`/topic/健康`）需要服务端把路径重写到 `index.html`。

### Cloudflare Pages

已内置 `public/_redirects`：

```
/*    /index.html   200
```

### Vercel

在项目根目录新增 `vercel.json`：

```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

### 其它静态托管（Nginx / Netlify 等）

将 404 回退到 `/index.html` 即可。

## 数据访问层（api 接口约定）

组件/页面统一走 `src/api` 契约（mock/fetch 双轨），REST 端点与统一响应结构见 [`src/api/README.md`](src/api/README.md)。

## CI

GitHub Actions 已配置 `.github/workflows/ci.yml`：`lint` + `test` + `build`。
