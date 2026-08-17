# 毛邻 V5（阶段一 P2 打磨）QA 验证报告

> QA 工程师 严过关 · 独立验证（不轻信工程师自述）
> 项目路径：`D:\WorkBuddy_Work\Product Design\毛邻\`
> 验证日期：本次会话 · 结论：**通过，路由 Send To NoOne**

---

## 一、命令级验证（独立实跑，非引用既有日志）

| 命令 | 结果 | 说明 |
|------|------|------|
| `npx vitest run` | ✅ **39 文件 / 212 用例全绿** | 独立重跑，末行 `Test Files 39 passed (39) · Tests 212 passed (212)` |
| `npm run lint` | ✅ **0 错误** | `eslint src` 退出码 0，无告警输出 |
| `npx tsc --noEmit` | ✅ **0 错误** | TS strict 类型检查通过 |
| `npm run build` | ✅ **构建通过** | `tsc && vite build`，`✓ 1896 modules transformed · built in 3.85s` |

> 说明：构建因 WorkBuddy `safe-delete` shim 拦截 `vite` 的 `emptyOutDir` 批量删除 dist，首次被拦。按提示用 PowerShell 清空 `dist/` 后重跑，构建一次通过。该 shim 拦截属运行环境行为，非项目缺陷。
> 字体 `noto-sans-sc-400/700.woff2` 未落盘，build 仅提示「didn't resolve at build time」仍成功，符合 PRD「woff2 未落盘属预期，验证不崩」。

---

## 二、17 项逐项结论（引用真实代码佐证）

### 产品项（9）

| # | 项 | 结论 | 佐证 |
|---|----|------|------|
| P1 | 收藏 | ✅ | `FavoriteButton.tsx` 统一组件四处同源：`PostCard.tsx:73/188`、`QaItem.tsx:50`、`PostDetailPage.tsx:161`、`QaDetailPage.tsx:100`；`toggleFavoriteReducer`（`actions.ts:40`）幂等增删；`favorites` 进 `partialize`（`useAppStore.ts:256`）+ `merge`/`migrate` 兜底；`ProfilePage.tsx:25` 动态/收藏分段；`Icon` 用 `fill={isFavorite?'currentColor':'none'}` 实现描边↔填充；刷新保留由 persist 保证（`favorites.test.tsx:32` 断言写 localStorage） |
| P2 | 作者主页 | ✅ | `/user/:id` 路由（`router.tsx:39`）+ `UserProfilePage.tsx`；5 处入口打通：`PostCard.tsx:42/101`、`PostDetailPage.tsx:84`、`CommentItem.tsx:41`、`QaDetailPage.tsx:195`（AnswerCard）、`SearchPage.tsx:140`（UserRow `navigate('/user/'+id)`）；`deriveUserStats` 派生统计；`FollowButton` 同 store 状态一致；`u_me`→`/profile` 重定向（`UserProfilePage.tsx:23`）；unknown→`EmptyState`（`:28`） |
| P3 | 骨架屏 | ✅ | `Skeleton.tsx` `animate-shimmer`+`aria-hidden`；接入 `FeedList`（`FeedSkeleton` 加载/刷新，`role=status`）、`QaList`（`loading` prop→骨架行）、`PageFallback`（Skeleton+Mascot）；`index.css:159` 定义 `.animate-shimmer` + `@keyframes shimmer`（1.4s 循环，不受 300ms 规范约束）；无残留可见「加载中」文字（FeedList/QaList 仅 `aria-label` 保留，供读屏） |
| P4 | 发帖引导 | ✅ | `PublishSheet.tsx:88` 发布成功调 `showPublishGuide()`；`PublishGuide.tsx` 5s `setTimeout` 自动消失 + 手动关闭 + 三入口；`publishGuide` 不在 `partialize`（不进 persist） |
| P5 | vibrate | ✅ | `vibrate.ts` `safeVibrate`：存在性判断 + try/catch；`PostCard.tsx:26`、`PostDetailPage.tsx:49` 点赞调用 `safeVibrate(15)`；jsdom 无 `navigator.vibrate` 静默返回 |
| P6 | 缩略卡 | ✅ | `PostCard` `variant:'full'|'compact'`（`:14`）；compact 左文右图 `h-[88px] w-[88px]` + `line-clamp-2`（`:53/79`）；`FeedPage.tsx:69` 关注 Tab `compact`、推荐 `full` |
| P7 | 吉祥物 | ✅ | `Mascot.tsx` 3 变体（wave/sit/heart ≥2），`fill="currentColor"`，内联 SVG 远 <2KB；贯穿 `EmptyState`（sit）、`PageFallback`（wave）、`PosterPreview`（heart） |
| P8 | 同城 POI | ✅ 延后 | 未引入 SDK，维持城市+分区（`LocalView` 现状即交付），符合 PRD |
| P9 | 海报 | ✅ | `ShareSheet.tsx:83` 「生成海报」入口；`poster.ts` Canvas 手绘（Logo+文案前60字+emoji首图+slogan+爪印）+ `toDataURL` 下载；`getContext('2d')` 为 null（jsdom）返回 `''`；http 远程图降级 emoji（`poster.ts:88-90`） |

### 工程项（9）

| # | 项 | 结论 | 佐证 |
|---|----|------|------|
| E1 | 深色模式 | ✅ | 3 处硬编码收敛：body `var(--color-canvas)`（`index.css:114`）、`AppShell bg-canvas`（`:15`）、`TopBar bg-error`（`:73`，原 `#E24B4A` 已消失）；`[data-theme='dark']` 覆盖块（`index.css:77`）；三态 `light/dark/system`（`theme.ts`）+ `prefers-color-scheme`（`resolveTheme`）+ 手动切换（`TopBar` 三态循环，`aria-label="切换主题"`）+ 独立 key `maolin-theme` 持久化；刷新保留（`main.tsx:11` 先 `applyTheme`）；品牌绿 hue 不变（light `#1d9e75`→dark `#2fbf8f`，仅调明度） |
| E2 | store 切片 | ✅ | 逻辑切片落 `actions.ts`（10 个纯函数，无副作用、不 import store）与 `selectors.ts`（5 个具名 selector）；物理保留单 store + 单 persist 键 `maolin-store-v1`；`partialize`/`merge`/`migrate` 三处同步，`version` 保持 1 不 bump |
| E3 | computeHealthStatus | ✅ | 仅 `lib/health.ts` 一处定义；消费方（`HealthBanner`/`PetDetailPage`/`HealthRecordList`/`healthStatus.test`）均改 `@/lib/health`；`types/index.ts:178` 注释确认迁出；grep 无散落实现 |
| E4 | ID 收敛 | ✅ | `lib/id.ts` 唯一 `genId`；`mock/data`、`api/local`、`lib/mockApi`、`store/useAppStore`、`store/actions` 均 `import { genId } from '@/lib/id'`；grep 无 `Math.random().toString(36)` 散写 |
| E5 | Toast Token | ✅ | `index.css:189` 定义 `.bottom-toast`；`Toast.tsx:8` 使用；grep 无裸 `bottom-24` |
| E6 | 字体 | ✅ | `@font-face` 400/500→400 回退/700 + `font-display:swap` + `system-ui` 回退（`index.css:6-26`）；`index.html:13-26` preload 400+700；woff2 未落盘（仅 README），属预期，build 不崩 |
| E7 | persist 防抖 | ✅ | `debouncedStorage.ts`「首写同步 + 尾写合并（leading+trailing coalesce）」；`useAppStore.ts:130` `createDebouncedStorage(400)`；`beforeunload`/`visibilitychange` 兜底；`helpers.ts` 复用 `persistStorage.reset()` 复位窗口 |
| E8 | 多标签同步 | ✅ | `storageSync.ts` `lastApplied` 同值守卫 + 只同步 8 个持久化字段（posts/questions/pets/healthRecords/comments/notifications/currentUser/favorites），绝不覆盖视图态；`main.tsx:12` 启动接线 |
| E9 | memo + userMap | ✅ | `PostCard.tsx:195` `memo(PostCardBase)`；`userMap` O(1)（`lib/userMap.ts` 纯函数、不 import mock）；`toggleLikeReducer` 仅替换目标引用；消费方 `userMap[id] ?? currentUser`（PostCard/PostDetail/CommentItem/QaDetail/PosterPreview），grep 无 `users.find` 线性查找残留 |

---

## 三、回归确认（V1~V4 行为未破坏）

212 用例中 172 条为存量（V1~V4），全部通过，覆盖：Feed（feedFilter/feedList）、问答（qaList/qaIncentive）、评论（comments）、关注（follow）、宠物详情（petDetail/petForm/petPicker）、通知（notifications）、搜索（search）、话题（topic）、同城（localView）、分享（share）、图标/动画/Logo（commonComponents/components/a11y）、健康（healthStatus/healthBanner）、store/persist/toastTimer/mockApi/stats/tagPicker/imagePicker/publishSheet 等。仅 `healthStatus.test.ts` 改 import 行，`test/helpers.ts` 补 3 字段重置，与设计 §8 一致。

---

## 四、新增 40 测试真实性抽检（非空壳）

10 个新测试文件合计 40 用例（4+7+3+2+4+4+3+6+4+3），逐一读码确认均为**真实断言**（非 `expect(true).toBe(true)` 空壳）：

- `favorites.test.tsx`（7）：幂等增删、type 隔离、localStorage 写入、四处同源点击写 store
- `userProfile.test.tsx`（4）：作者信息/派生统计值、TA 动态、`u_me` 重定向、unknown 空态
- `theme.test.tsx`（6）：三态解析、非法值回退、`<html data-theme>`、独立 key、TopBar 三态循环
- `debouncedStorage.test.ts`（4）：首写同步、尾写合并（fake timers）、脏数据 null、removeItem
- `storageSync.test.ts`（3）：8 字段同步+视图态不覆盖、key/null 忽略、`lastApplied` 同值守卫
- `publishGuide.test.tsx`（4）：open 显隐、5s 自动消失、手动关闭、发帖触发
- `skeleton.test.tsx`（4）：shimmer/aria-hidden、QaList loading、空态、PageFallback
- `postCardVariant.test.tsx`（2）：compact clamp-2+88×88、full 200px 不 clamp
- `vibrate.test.ts`（3）：无 vibrate 静默、透传 pattern、抛错捕获
- `id.test.ts`（3）：id 格式、100 次不重复、computeHealthStatus 迁移后四态边界

---

## 五、发现的 Bug

**源码 Bug：无。** 17 项验收要点全部满足，无断言预期正确但实现输出错误的场景，无需回给工程师修复。

## 六、遗留 / 非阻塞观察（不影响交付）

1. **Mascot 眼睛/鼻子硬编码 `#fff`**（`Mascot.tsx:39-42`）：主体 `fill=currentColor` 已适配深色，但眼睛/鼻子为白色镂空，深色模式下主体提亮为浅绿时对比度略降。属视觉微瑕，非功能缺陷，不阻塞。
2. **`genId` 理论长度边界**：`Math.random().toString(36).slice(2,10)` 在极罕见精确分数随机值下可能不足 8 位，`id.test.ts` 的 `/^id_[0-9a-z]{8}$/` 存在测度为零的理论抖动。此为 V1~V4 既有约定（设计 §7.1 明文指定），实际概率可忽略，不阻塞。
3. **woff2 字体未落盘**：`public/fonts/` 仅 README，无二进制；已文档化为可接受临时态，运行时回退 system-ui，build 不崩。
4. **`createDebouncedStorage` 未解绑 `beforeunload`/`visibilitychange` 监听**：生产单实例无影响；测试中多实例累积监听器，但用例仍稳定通过。

## 七、路由判定

**Send To NoOne（全部通过）。**

- 测试 39 文件 / 212 用例全绿（独立实跑）
- lint 0、tsc 0、build 通过
- 17 项逐项验证均符合 PRD/设计验收
- 40 个新增测试为真实断言
- 无源码 Bug；仅 4 条非阻塞观察，无需修复
