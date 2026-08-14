# 毛邻宠物社区 V3（P1）独立验证测试报告

> 验证人：QA 工程师 严过关（独立验证者，不轻信工程师自述）
> 基线：V1+V2（commit `bc9dc55`，133 断言全绿）
> 验证方式：真实运行测试/构建/lint + 逐项源码抽查 + git diff 溯源
> 验证时间：2026-08-13

---

## 0. 结论速览

| 项 | 结果 |
|---|---|
| 全量测试 | ✅ **29 文件 / 168 用例 全绿**（Exit 0，与工程师宣称一致） |
| 类型检查 `tsc --noEmit` | ✅ 通过 |
| 构建（全新 outDir） | ✅ 通过（懒加载 + vendor 拆分生效） |
| 构建 `npm run build`（本机） | ⚠️ 被 safe-delete shim 拦 dist 清理而失败（环境问题，非代码问题） |
| Lint | ❌ **12 errors + 1 warning（Exit 1）** |
| 8 项功能 | ✅ 核心逻辑全部正确，3 处轻微 PRD 偏差 |
| 9 项工程 | ✅ 8 项达成，1 项（CI）**必挂**、1 项（字体）临时态 |

**智能路由结论：回传工程师（1 项阻塞：CI 必挂）＋ 交 PM 确认（3 项轻微 PRD 偏差）。**
无「懒加载白屏」「逻辑错误」级别的源码 Bug；测试代码本身无 Bug（未发现断言被弱化）。

---

## 1. 全量测试（真实运行，非照抄）

```
$ npx vitest run --reporter=dot --testTimeout=20000
Test Files  29 passed (29)
     Tests  168 passed (168)
  Duration  74.02s
```

- 测试文件数：**29**，用例数：**168**，通过率 **100%**，Exit **0**。与工程师宣称完全一致。
- 新增测试文件 11 个（search/topic/share/imagePicker/petPicker/tagPicker/petForm/localView/stats/a11y + 既有修正）均已覆盖且通过。
- 注意：`npm run test` 在本机（forks 池 + jsdom 环境初始化约 100s）总耗时约 74s，非「秒回」，属正常，非挂起。

---

## 2. 构建与产物验证

### 2.1 类型检查
`npx tsc --noEmit` → **Exit 0**，TS strict 无错。

### 2.2 构建
- `npm run build` 在本机被 WorkBuddy 的 `safe-delete` shim 拦截（清空 `dist/assets` 时 `trash` 操作失败）→ 失败。**属沙箱环境问题，非代码缺陷**。
- 绕过方案（全新 outDir）：`npx vite build --outDir dist-v3-verify` → **Exit 0，built in 2.46s**。

### 2.3 产物结构（dist-v3-verify/assets）
```
index-*.js              54.78 kB   ← 主 chunk（应用代码）
vendor-router-*.js     204.66 kB   ← react + react-dom + react-router-dom 合并于此
vendor-react-*.js        0.04 kB   ← ⚠️ 空 shim（仅一行 re-export，见 §5-E1）
SearchPage/TopicPage/PostDetailPage/QaDetailPage/PetDetailPage/NotificationPage  ← 6 个懒加载页 chunk（各自独立）
time-*.js                0.24 kB   ← 共享小 chunk
```
**懒加载确实生效**（6 个二级/新页面独立成 chunk，首屏 3 Tab 页静态 import）。⚠️ 但「react/router 分离」未完全达成（vendor-react 为空 shim），详见 §5。

---

## 3. 逐项功能验证（8 项）

### P1-1 全局搜索 ✅（1 处轻微偏差）
- `/search` 路由可达；TopBar 搜索图标 `onClick → navigate('/search')`，内联搜索已删（TopBar 已移除 `search`/`onSearchChange` props）。✅
- SearchPage：返回 + `autoFocus` 输入框；帖子(content/tags/petTag)/问答(title/content)/用户(name/city)/宠物(name/species/breedTag) 四类聚合、忽略大小写；空态「没有找到相关内容」+「试试其他关键词」+ 去发帖/去提问；用户点击 Toast「个人主页开发中」。✅
- FeedPage 内联搜索 state 与过滤逻辑已彻底移除（`filtered` 中已无 keyword 相关代码）。✅
- ⚠️ **偏差**：PRD 写「4 分类 Tab（帖子/问答/用户/宠物，**默认帖子**）」，实现为「**5 Tab**（全部/帖子/问答/用户/宠物，**默认全部**）」。设计文档 §5.1 亦写 5 Tab，属 PRD/设计不一致，功能是超集，需 PM 确认是否接受。

### P1-2 话题/标签 ✅
- PostCard/PostDetail 标签渲染为 `<Link to=/topic/:tag>`（`encodeURIComponent` 编码）。✅
- TopicPage：`/topic/:tag` 聚合 `p.tags.includes(tag)` 帖子 + 标题/内容/分类中文名命中问答；显示计数「N 条帖子 · M 条问答」；空态 + 去发帖/去提问。✅
- 发帖 TagPicker 多选 ≤5（`handleTagsChange` 分类标签固定第一位去重 + `slice(0,5)`，超限 Toast「最多选择 5 个标签」）；不选时写分类默认标签。✅
- 说明：整卡已无 `div onClick`，故标签用 `<Link>`（导航语义）替代「button + stopPropagation」，语义上等价且更优，不构成缺陷。

### P1-3 关联宠物 ✅（1 处缺口）
- PetPicker 多宠横排单选，默认 `pets[0]`（`useState(pets[0]?.id)` + `value ?? pets[0].id`），选中绿描边；空宠回退「🐶 豆豆」不阻塞发帖。✅
- 发帖提交写 `petId`、`petTag`（`${emoji} ${name}`）；`makePost` 透传 `petId`；测试断言 `posts[0].petId === 'p1'`。✅
- 帖头/详情品种徽章：`pets.find(p => p.id === post.petId)` 命中显示 `breedTag`，旧帖保持原 petTag。✅
- ⚠️ **缺口**：PRD 写「**提问可选关联（默认不关联）**」。实现中 question 模式**无 PetPicker**、`addQuestion` **不传 petId**，`Question.petId` 为死字段（仅类型/工厂透传，无任何 UI 可设）。「可选关联」未落地，需 PM/工程师确认是否本期补齐。

### P1-4 图片 ✅
- ImagePicker：隐藏 `input[type=file multiple accept=image/*]` + 缩略图 + 「＋」tile；FileReader→dataURL；三重拦截（张数 ≤9 / 单图 ≤800KB / 总量 ≈4MB，均 Toast）；可删除。✅
- 卡片首图 + 「共N张」角标（`images.length>1`）；详情页大图同样 `isRealImage` + 角标。✅
- 无图 fallback：卡片 `pet.emoji` 或 `🐾`，始终渲染。✅
- `isRealImage` 统一收敛 `lib/image.ts`（`data:image/` 或 `http` 开头），全项目已无散写 `startsWith('http')`（grep 确认仅 image.ts 一处）。✅
- ⚠️ 轻微：总量拦截用 `file.size`（原始字节）估算，dataURL 实际约膨胀 4/3，4MB 原始图 → ~5.3MB 存储，逼近 localStorage 5MB 配额。PRD 为「≈4MB 拦截」，可接受，但建议后续按 dataURL 字节数更严格校验。

### P1-5 统计真实化 ✅
- `deriveUserStats` 派生：动态=posts authorId=me 数、回答=answers 中 authorId=me 条数之和、关注=followingIds.length、粉丝=固定 230。✅
- ProfilePage 仅消费派生值，**不再读 `stats.posts/answers/following`**（grep 确认）。种子初始动态=1（post_6）/回答=0/关注=2/粉丝=230 与 PRD 一致。✅

### P1-6 提问双输入 ✅
- 标题 input（placeholder「一句话概括你的问题」`maxLength=60` 必填）+ 详情 textarea（选填 rows=4）。✅
- 空标题 Toast「请输入标题」；提交 `title=标题`、`content=详情`，**无 `slice(0,50)`**（grep 确认）。✅
- QaItem 详情摘要 `line-clamp-1`。✅

### P1-7 同城 LBS ✅（1 处缺口）
- local Tab 渲染 `<LocalView/>`（`FeedPage` 提前 return，不再走 FeedList）；CityPicker（默认 `currentUser.city`=杭州，mock CITIES 5 城）；4 分区（医院/约玩/宠物店/找宠友）每区 ≥2 条杭州种子；切换城市过滤；该城市无数据空态。✅
- 全项目**无 `navigator.geolocation`**（grep 确认）。✅
- ⚠️ **缺口**：PRD 写「**现有 local 帖并入对应分区**」。实现中 LocalView 仅渲染 `seedLocalEntries`，两条 `source==='local'` 种子帖（post_5 同城宠物医院、post_7 同城猫友聚会）在 local Tab 不再展示（其余 Tab 也不展示 local 帖），从信息流「消失」。需 PM 确认是否接受（或应并入对应分区）。

### P1-8 分享 ✅
- ShareSheet 复用 BottomSheet；「复制链接」→ `navigator.clipboard.writeText(${origin}/post/:id)` + `incrementShare` + Toast「链接已复制」+ 关闭。✅
- `navigator.share` 可用则显示「系统分享」并调用，成功 `shares+1` + Toast「分享成功」，取消不计；不可用则隐藏（降级到复制链接）。✅
- `incrementShare` 仅改 `post.shares`（已持久化字段），刷新后保留。✅

---

## 4. 工程项验证（9 项）

| # | 项 | 结论 |
|---|---|---|
| E1 | 路由懒加载 + vendor 拆分 | ✅ 懒加载 6 页 + Suspense/PageFallback 生效；⚠️ vendor-react 为空 shim（见下） |
| E2 | Fonts self-host/preload | ⚠️ 临时态：woff2 未落盘，回退 system-ui 不崩（见 §6） |
| E3 | 语义化 + 键盘可达 | ✅ PostCard/QaItem `article` + `Link`，可聚焦（a11y.test 通过） |
| E4 | prompt→PetForm Sheet | ✅ `window.prompt` 全项目清零（grep 仅注释），PetForm 弹层生效 |
| E5 | 死按钮核实 | ✅ PostDetail 分享 `span` → `<button onClick=openShare>`；无其它死按钮 |
| E6 | 种子日期滚动 | ✅ `rollHealthRecordDates` 按 seed id 重锚定，`merge` 阶段调用 |
| E7 | CI ci.yml | ❌ **必挂**（含 `npm run lint`，lint 12 errors 必失败） |
| E8 | SPA fallback | ✅ `public/_redirects` + README 部署节（CF/Vercel 均说明） |
| E9 | api 约定 | ✅ `src/api/README.md` + `types.ts` REST DTO 注释齐备 |

### E1 补充：vendor-react 空 shim（轻微，无功能影响）
`vendor-react-*.js` 仅 0.04KB，内容为一行 `import"./vendor-router-*.js"`。原因：`react-router-dom` 依赖 `react`，Rollup 在 manualChunks 对象模式下把 react/react-dom 并入了 vendor-router（204KB）。结果「react/router 分离」**未真正实现**——react 与 router 仍在同一 chunk。功能（懒加载、vendor 与主包分离）不受影响，仅拆分粒度未达设计预期。若需真分离，应改用函数式 manualChunks 或 `splitVendorChunkPlugin`。

---

## 5. 关键问题：CI 必挂（需回传工程师）

### 事实链
1. `.github/workflows/ci.yml` 步骤：`npm ci → npm run lint → npm run test → npm run build`。
2. `npm run lint` 实测 **Exit 1**：`12 errors + 1 warning`。
3. 因此 **CI 在 `lint` 步必然失败**，后续 test/build 永不执行，流水线**永远红**。

### 12 个 lint 错误归属（git 溯源确认）
| 文件 | 错误数 | 是否 V3 引入 |
|---|---|---|
| `src/api/fetch.ts`（未用参数 ×10） | 10 | ❌ 基线（`git show HEAD` 一致） |
| `src/components/feed/FeedList.tsx`（refs during render） | 1 (+1 warn) | ❌ 基线（V3 未改此文件） |
| `src/store/useAppStore.ts`（`_version` unused） | 1 | ❌ 基线（V2 第 222 行即有，V3 diff 未触碰 migrate） |

**工程师「存量 lint 12 错属 V1/V2 基线遗留、非本次引入」判断本身属实**。但其将 lint 标为「非阻塞」时，**未考虑自己新增的 ci.yml 把 lint 设成了阻塞步骤**，导致 CI 交付物失效。

### 修复建议（二选一）
1. **修掉 12 个 lint 错误**（推荐，一次性根治）：fetch.ts 10 个未用参数改 `void _x` 或移除下划线未用约定；FeedList `loadMoreRef.current = loadMore` 移入 `useEffect`；useAppStore `_version` 改 `_version` 加 `void` 或注释忽略。
2. **让 CI 的 lint 非阻塞**：ci.yml 中 `npm run lint` 改为 `continue-on-error: true` 或 `npm run lint || true`，并注明「基线遗留待清」。

---

## 6. 两项非阻塞项独立核实

### 6.1 字体 woff2 未落盘（工程师标注）
- **属实**：`public/fonts/` 仅 README.md，无 woff2；构建后 `dist/fonts/` 同样仅 README。
- **回退不崩属实**：`src/index.css` 已写 `@font-face`（`font-display: swap`）+ `body { font-family: 'Noto Sans SC', system-ui, sans-serif }`，字体文件 404 后浏览器回退 system-ui，页面正常渲染。
- **遗留成本**：`index.html` 的 3 条 `<link rel=preload>` 指向不存在文件 → 生产环境每次加载产生 3 次 404 请求 + 控制台告警（不阻断）。建议：补齐字体后保留 preload；若暂不补，可先移除 3 条 preload 避免无效请求。

### 6.2 存量 lint 12 错（工程师标注）
- **确为基线遗留**（见 §5 溯源），非本次引入，判断属实。
- **但**：因 ci.yml 含 lint 步，**CI 会被 lint 卡死** → 需回传工程师（§5）。

---

## 7. 回归确认（V1/V2 行为未破坏）

全量 168 用例中，V1/V2 存量测试（Feed/点赞/问答流转/发布/评论/关注/宠物详情/通知/兽医激励/健康横幅/持久化迁移等）全部通过；源码抽查确认核心 store action（toggleLike/addComment/toggleFollow/addAnswer/markBestAnswer/persist migrate+merge）未被破坏。**无回归。**

非计划测试改动核查：`notifications.test.tsx` 被修改（移除已删除的 TopBar `search`/`onSearchChange` props）——属 TopBar API 变更导致的必要修正，非断言弱化，接受。

---

## 8. 遗留问题清单（汇总）

| 级别 | 问题 | 归属 | 建议 |
|---|---|---|---|
| 🔴 阻塞 | CI 必挂（ci.yml lint 步 + 12 lint errors） | 工程师 | 修 lint 或 lint 非阻塞（§5） |
| 🟡 轻微 PRD 偏差 | 提问「可选关联」无 UI（Question.petId 死字段） | PM/工程师 | 确认是否本期补齐 |
| 🟡 轻微 PRD 偏差 | local Tab 未并入现有 local 帖（post_5/post_7 从信息流消失） | PM/工程师 | 确认是否并入对应分区 |
| 🟡 轻微 PRD 偏差 | 搜索页 5 Tab 默认「全部」vs PRD「4 Tab 默认帖子」 | PM | 确认是否接受 |
| 🟡 轻微工程 | vendor-react 空 shim（react 并入 vendor-router） | 工程师 | 可选：改函数式 manualChunks |
| 🟢 临时态 | 字体 woff2 未落盘（生产 3 次 404 preload） | 工程师 | 补字体或移除 preload |
| 🟢 环境 | 本机 `npm run build` 被 safe-delete shim 拦截 | 环境 | 非代码问题，CI/正常机不受影响 |

---

## 9. 智能路由结论

**回传工程师（1 项阻塞）**：CI 必挂（ci.yml 含 `npm run lint` 而 lint 12 errors 必失败）。其余功能/工程实现正确、测试全绿，无懒加载白屏、无逻辑错误、无测试代码 Bug（无需 QA 自修）。

**交 PM 确认（3 项轻微 PRD 偏差）**：提问可选关联、local 帖并入分区、搜索 Tab 数量/默认项——均属 PRD 与实现/设计的轻微出入，需产品口径裁决，不阻塞功能上线。
