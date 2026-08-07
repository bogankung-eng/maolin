# 毛邻宠物社区 V2 测试报告（QA 独立验证）

> 验证人：严过关（software-qa-engineer）· 独立验证，不采信工程师自报
> 验证对象：`D:\WorkBuddy_Work\Product Design\毛邻\`（V1 基础上 V2 增量，git 未提交，工作区即当前状态）
> 基线：`毛邻宠物社区_V2增量PRD.md`（产品 P0-1~6）+ `docs/system_design_v2.md`（工程 P0-7~11）
> 验证时间：2025-08-06

---

## 一、总览

| 项目 | 结果 |
|---|---|
| 测试文件数 | **19 个**（工程师口径一致） |
| 用例数 | **133 个**（工程师口径一致） |
| 通过 | **133 / 133**（100%） |
| EXIT | **0**（实测 `npm run test`，非抄报告） |
| 构建（代码侧） | `tsc --noEmit` 通过；`vite build` 全新输出目录成功（87 模块） |
| 构建（环境侧） | ⚠️ 标准 `npm run build` 在本机沙箱下失败（safe-delete shim 拦截 dist 清理，**非代码 Bug**，详见 §四） |
| 智能路由结论 | **NoOne（无源码 Bug，无需工程师修复）** |
| 遗留问题 | 1 项环境性问题（构建需先清空 dist 或在非沙箱环境执行），不影响交付 |

**结论：V2 已按 PRD/设计交付，11 项 P0 全部验收通过，无回归，无源码 Bug。**

---

## 二、全量测试实测

```
Test Files  19 passed (19)
     Tests  133 passed (133)
Start at  22:08:10
Duration  30.83s
NPM_EXIT=0
```

复跑确认（临时验证用例移除后）：`Test Files 19 passed (19) / Tests 133 passed (133) / NPM_EXIT=0`。

新增 8 个测试文件 + 修改 2 个：comments(7)、follow(7)、petDetail(6)、notifications(7)、qaIncentive(7)、healthBanner(6)、feedList(4)、toastTimer(2)、persist(7)、feedFilter(7，含 QA 过滤) 等 —— **全部为真实断言，无空壳/全 mock 测试**（逐文件通读核实）。

---

## 三、逐项验证结论（P0-1 ~ P0-11）

### P0-1 评论体系 —— ✅ 通过
- PostDetailPage 评论区真实渲染（种子评论 + 楼中楼 c2→c1 样例）；空态「还没有评论，快来抢沙发～」。
- 发送逻辑：空输入 → toast「请输入评论内容」不新增；非空 → `addComment` 前插 + 输入框清空 + toast「评论已发布」。
- 计数回写：`store.addComment` 内 `posts[].comments +1`，详情页「评论 N」与 Feed 卡片同 store 自动同步（测试：评论后 Feed 显示 24）。
- 楼主一级回复：CommentItem 顶层有「回复」→ 内联输入框 → `addComment(postId, text, parentId)`；子回复缩进（pl-8）且**不再显示「回复」按钮**（测试断言仅 1 个回复按钮）。
- 评论数按条数计（回复同样 +1，测试：回复后 23→24）。

### P0-2 关注闭环 —— ✅ 通过
- FollowButton 三态：未关注「＋ 关注」品牌绿 / 已关注「已关注」灰 / `userId===currentUser.id` 不渲染；点击 `stopPropagation`（测试：点击不触发卡片跳转）。
- `toggleFollow` 不可变增删 followingIds；`partialize` 含 currentUser → 刷新保留。
- Feed「关注」Tab 按 `followingIds.includes(p.authorId)` 过滤（**替换 source 冒充**），分类/搜索在关注流内继续生效。
- 空关注流：提示条「关注感兴趣的主人来这里看 TA 的动态」+ 推荐兜底，不白屏（测试覆盖）。
- 详情页作者区与 Feed 卡片同源 store，状态一致；「我的-关注」统计派生 `followingIds.length`（种子=2）。
- **feedFilter.test.tsx 新语义断言合理、未弱化**：新语义下 post_1(u_lin) 出现、post_2(u_chen) 不出现 + 新增空态兜底用例（属设计明示允许的唯一语义调整，且为加强断言）。

### P0-3 宠物详情页 —— ✅ 通过
- 路由 `/pet/:id` 就位；ProfilePage PetCard `onClick → navigate('/pet/'+pet.id)`；PetCard 有 onClick 时显示「›」+ cursor + active 反馈。
- 头部：emoji 52 radius14 绿底 / 名称 / 品种 pill / 健康提醒文案（`pet.healthReminder` 优先，否则按异常记录生成）。
- 健康记录**仅该宠**按 疫苗/驱虫/体重 分组，复用 HealthRecordList 状态色（正常绿/即将到期橙/已超期红/未设置灰）。
- 成长信息：健康记录数 + 相关帖子数 pill + 体重列表（值+日期）。
- 相关帖子按 `petTag` 含宠物名/emoji 聚合；空态「还没有 TA 的动态」；不存在 id → 「宠物不存在」+ 返回。

### P0-4 通知中心 —— ✅ 通过
- TopBar 铃铛 + 未读红角标（`#E24B4A`，>99 显示 `99+`）；种子未读 3 条 → 角标显示「3」（测试断言）。
- `/notifications` 路由；4 类种子各 ≥1 条（like/comment/answer/health），read/unread 混合，target 指向真实实体 post_6/q3/p2。
- 进入即 `markAllNotificationsRead()`（幂等，StrictMode 安全）；返回角标消失；已读状态持久化。
- 跳转映射：post→`/post/:id`、question→`/qa/:id`、pet→`/pet/:id`（三类跳转均有测试）。
- 空态「暂时没有新通知」。

### P0-5 兽医认证与回答激励 —— ✅ 通过
- QaStatusFilter（全部/待解答/已解决/紧急）激活样式复用 CategoryFilter；本地 state 不持久化。
- 待解答 = `status==='open'`，含 0 回答 q4；**urgent 在待解答下不出现**（q3 不显示，测试断言）。
- 与分类叠加：医疗+待解答 → 仅 q5（测试断言）。
- 采纳后 toast「已标记最佳答案，问题已解决」+ status→resolved（测试断言）。
- 激励徽章：被采纳兽医回答「+50 分 · 最佳答主」（品牌绿底）、非兽医「+20 分 · 优质回答」（暖灰底）；「最佳答案」徽章与「✓ 兽医」绿标保留；无积分余额/排行榜。

### P0-6 健康提醒主动化 —— ✅ 通过
- HealthBanner 位于 TopBar 与 CategoryFilter 之间（FeedPage 插入位置正确）。
- p1 due-soon 橙「豆豆 · 体内驱虫 即将到期」；p2 overdue 红「咪咪 · 猫三联 已过期」且**置顶在前**（测试断言顺序 + className）。
- 同一宠物多条异常只出 1 条（取最高严重级 overdue > due-soon，测试：p1 追加 overdue 后只显示「已过期」）。
- normal/none 宠物不出（p3 年度体检无日期 → none 不出，测试断言）。
- 无异常宠物整区 `return null` 不占位；点击跳 `/pet/:id`；`computeHealthStatus` 实时计算，新增异常记录即时出现（测试断言）。

### P0-7 api 层 —— ✅ 通过
- `src/api/` 5 文件完整：types.ts（FeedApi 5 方法契约）/ mock.ts（async 薄封装）/ fetch.ts（占位 throw「真实后端尚未接入，请在 fetch.ts 实现」，合理）/ local.ts（4 个同步桥，复用 makePost/makeQuestion/makeComment 同源工厂）/ index.ts（`VITE_API_MODE==='fetch'` 切换 + local 导出）。
- FeedList.loadMore 确实走 `api.getFeedPage(page, PAGE, list)`（sourceList 注入已过滤列表）。
- store 四个插入 action（addPost/addQuestion/addAnswer/addComment）全部走 `insert*Sync` 同步桥。
- `.env.example` 存在（VITE_API_MODE=mock）；`vite-env.d.ts` 就位；`lib/mockApi.ts` 过期 stub 注释已清理。

### P0-8 FeedList 竞态 —— ✅ 通过
- `loadingRef` 同步防抖（连续 IO 只 loadMore 1 次，测试断言 visible=12 而非 18）；`mountedRef` 卸载取消（unmount 后 pending 回调不 setState 不报错，测试覆盖）；`listRef` 列表变更丢弃过期响应；`visibleRef` 页码镜像。
- IO 只依赖 `[posts]` 重建；posts 变更重置 visible 到 PAGE（测试断言）。

### P0-9 persist 迁移 —— ✅ 通过（含 QA 独立构造用例）
- `version:1` + `migrate`(v0→v1) + `merge` 字段级校验 + `partialize` 仅 7 字段（posts/questions/pets/healthRecords/comments/notifications/currentUser）；视图态（activeTab/toast/publishOverlay）不入库。
- **QA 独立验证**（临时测试 3 用例，已删除）：
  1. 真实 V1 旧数据（自定义帖子 + 点赞态 liked=true、缺全部 V2 新字段、version:0）→ hydrate 后**不崩**、V1 帖子与点赞态保留、comments/notifications 回退种子、followingIds=['u_lin','u_zhou'] ✅
  2. 脏值（posts 非数组、currentUser 缺 followingIds、version:1）→ merge 回退种子不崩 ✅
  3. notifications/comments 脏值（非数组）→ 回退种子且未读态正常 ✅

### P0-10 测试补盲 —— ✅ 通过
- 8 个新测试文件逐一通读：feedList(竞态/卸载/重置)、toastTimer(2.2s 自动隐藏/连续重置)、comments(发送/拦截/置顶/计数回写/回复/子回复无回复/空态)、follow(三态/过滤/空态兜底/stopPropagation)、petDetail(分组/成长/相关帖子/空态/不存在)、notifications(4 类/全读/三类跳转/角标/空态)、qaIncentive(筛选叠加/激励徽章 vet vs 非 vet/toast 文案)、healthBanner(置顶/每宠 1 条/不渲染/实时/跳转)——**均非空壳、非全 mock**。
- persist.test.ts 含迁移用例；feedFilter.test.tsx 按新语义更新（见 P0-2）。

### P0-11 safe-area —— ✅ 通过
- `index.css` 定义 `.pb-safe-nav` / `.bottom-safe-nav` / `.h-safe-nav`（`calc(72px + env(safe-area-inset-bottom))`）。
- AppShell `main` 用 `pb-safe-nav`；BottomNav 用 `h-safe-nav` + `pb-[env(safe-area-inset-bottom)]`；QaDetailPage 输入条用 `bottom-safe-nav`。未发现残留裸 `pb-[72px]`/`bottom-[72px]`。

---

## 四、构建验证与发现

| 检查 | 结果 |
|---|---|
| `npx tsc --noEmit` | ✅ 通过（EXIT=0，无 TS 错误） |
| `npx vite build --outDir dist-verify --emptyOutDir`（全新目录） | ✅ 成功：87 模块，CSS 14.20 kB + JS 259.28 kB |
| `npm run build`（标准，清理已有 dist） | ❌ 失败——**环境问题，非代码 Bug** |

**失败根因（已定位）**：vite 在 `emptyDir` 阶段调用 `fs.rmSync` 清空旧 `dist`，被 WorkBuddy 沙箱的 safe-delete shim 拦截并转交 `genie-trash`（Windows 二进制）处理。该 shim 对 Git Bash 路径 `/d/...` 转换失败（relative path rejected）或超时（ETIMEDOUT），导致清理步骤中断。**代码本身（tsc + 打包）全部通过**，工程师「build 通过」在干净环境下成立。

**处置建议（非阻塞）**：在无 safe-delete 拦截的环境执行标准 `npm run build`，或先手动清空 `dist` 后构建；产物已通过 `dist-verify` 验证与代码无关。

---

## 五、回归确认（V1 行为未破坏）

- Feed 分类过滤（recommend/local/category/search）——feedFilter.test.tsx 通过 ✅
- 点赞 toggleLike（+1/-1/幂等/不影响他帖）——store.test.ts 通过 ✅
- 问答状态流转（紧急置顶 + 时间倒序、markBestAnswer/markUrgent/resolveQuestion）——qaList/store/qaIncentive 通过 ✅
- 发布双模式（发帖/提问）——publishSheet/store 通过 ✅
- 我的页统计/宠物/动态九宫格——profilePage.test.tsx（13 用例）通过 ✅
- 存量测试 diff 核查：改动仅为 prettier 格式化/过时注释清理（qaList、healthStatus、mockApi、store、components），**无断言语义弱化**；唯一语义调整 = feedFilter following 用例（设计 §12-10 明示允许，且为加强）。

---

## 六、发现的问题与处置

| # | 类型 | 描述 | 处置 |
|---|------|------|------|
| 1 | 环境性（非源码） | 标准 `npm run build` 在本机沙箱下因 safe-delete shim 拦截 dist 清理失败；tsc 与打包本体通过 | 已在 §四说明，建议干净环境构建；不阻塞交付，无需改代码 |
| 2 | 无 | 未发现源码 Bug / 测试 Bug / 断言弱化 / migrate 丢数据 | — |

---

## 七、智能路由结论

- **Send To: NoOne** —— 133/133 全绿、构建代码侧通过、11 项 P0 逐项核实符合 PRD/设计、无源码 Bug 需工程师处理、无测试 Bug 需自修。
- 唯一遗留：环境性构建清理问题（见 §四），建议在 CI/干净环境验证标准 build。
