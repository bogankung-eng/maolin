# 毛邻宠物社区 — 测试报告（QA：严过关）

> 测试框架：Vitest 2 + jsdom + @testing-library/react
> 运行命令：`npm run test`（= `vitest run`）
> 测试文件：`src/__tests__/*.test.ts(x)`；配置：`vitest.config.ts`、`src/test/setup.ts`、`src/test/helpers.ts`

## 一、总览

| 指标 | 数值 |
| --- | --- |
| 测试文件 | 6 |
| 测试用例总数 | 34 |
| 通过 | 32 |
| 失败 | 2 |
| 通过率 | **100%**（34/34）|
| 测试轮次 | 2（第 1 轮发现问题并自修测试 + 回传源码缺陷；第 2 轮工程师修复后回归全绿）|
| 智能路由结论 | 第 1 轮：Engineer（getFeedPage）+ QA 自修（markBestAnswer）；**第 2 轮：NoOne（全部通过）** |

## 二、覆盖范围（逻辑覆盖率，非插桩覆盖率，估算 ~80% 核心交互）

| 源文件 | 覆盖点 | 状态 |
| --- | --- | --- |
| `src/types/index.ts` | `computeHealthStatus` 全部边界（>30天/30天/29天/今天/昨天/超期/无日期体重/无日期非体重/种子数据）| ✅ |
| `src/store/useAppStore.ts` | toggleLike（点赞/取消/幂等/不影响他帖）、addPost、addQuestion、addAnswer、markBestAnswer、markUrgent、resolveQuestion、4 个视图态 setter | ✅ |
| `src/components/qa/QaList.tsx` | 紧急置顶 + 时间倒序排序、空列表占位 | ✅ |
| `src/pages/FeedPage.tsx` | Tab(source) 过滤、Category 过滤、内联搜索过滤、渲染 | ✅ |
| `src/pages/QaPage.tsx` | qaCategory 过滤、qaKeyword 过滤、渲染 | ✅ |
| `src/components/layout/BottomNav.tsx` | 5 入口 + 发布按钮渲染冒烟 | ✅ |
| `src/components/feed/FeedList.tsx` `PostCard.tsx` `QaItem.tsx` `TopBar.tsx` `CategoryFilter.tsx` `Avatar.tsx` `Badge.tsx` | 经页面渲染间接覆盖 | ✅ |
| `src/lib/mockApi.ts` | `getFeedPage` 分页（page=1/size=6 返回 6 条、page=2 返回剩余 1 条、无重叠、越界页返回 []）| ✅（工程师已修复并回归）|

## 三、发现的缺陷与处置

### 缺陷 1（源码 Bug → 已修复）：`getFeedPage` 恒返回空数组
- **位置**：`src/lib/mockApi.ts` 的 `getFeedPage(page, size)`
- **现象（第 1 轮）**：函数体 `void page; void size; return [];`，忽略分页参数，永远返回 `[]`。
- **影响**：需求第 9 项要求验证分页（连续取 page=1,2 / size=6，断言数量正确、无重叠、末页不足 size），当时无法满足。该接口在 `FeedList` 中未被实际调用（FeedList 走本地切片），疑似预留异步接口。
- **失败用例**：`src/__tests__/mockApi.test.ts`（2 个）
  - `page=1,size=6 返回前 6 条且数量正确` → expected 6, received 0
  - `page=2,size=6 返回剩余且不重叠` → expected >0, received 0
- **处置**：第 1 轮已回传工程师寇豆码。工程师采用方案 A 修复——基于 `seedPosts.slice` 做客户端分页，并对 page/size 加 `Math.max(1, Math.floor(...))` 防御，越界页返回 `[]`。
- **第 2 轮回归**：`npm run test` → **34 passed**；`npm run build` → tsc + vite build 干净通过，无回归。**路由：NoOne（已闭合）**。

### 缺陷 2（测试代码错误 → QA 自修）：`markBestAnswer` 测试断言越界
- **现象**：初版测试对 `q1`（仅 1 条回答 `a1`）断言“其余回答 isBest=false”，查到 `undefined` 抛 TypeError。
- **根因**：测试数据假设错误，`markBestAnswer` 源码逻辑本身正确（status='resolved'、目标回答 isBest=true 均通过）。
- **处置**：改用含 2 条回答的 `q2` 验证，重跑通过。**路由：QA 自修**。

## 四、边界与健壮性断言（已覆盖）
- 健康状态：今天 / +29天 / +30天（含边界）/ +31天 / 昨天 / -15天 / 无日期体重 / 无日期非体重。
- 点赞：未点赞→点赞（+1）、已点赞→取消（-1）、再次调用幂等复原、不影响其它帖子。
- 发布：新帖置顶、liked=false、likes=0、comments/shares=0、source 正确、authorId=u_me。
- 提问：status='open'、answers=[]、createdAt 时间近期。
- 问答：回答数同步 +1、isBest 重置语义、紧急置顶排序（紧急项创建更早仍置顶）。

## 五、遗留问题（Known Issues）
1. （已闭合）getFeedPage 分页缺陷已由工程师修复并回归通过，无遗留。
2. 未做插桩覆盖率统计（项目未配置 coverage），本报告覆盖率为逻辑范围估算。

## 六、结论
- **通过率**：34/34（100%）。
- **源码 Bug 需工程师处理**：否 —— 第 1 轮发现的 `getFeedPage` 分页 stub 已由工程师寇豆码按方案 A 修复，第 2 轮回归 34/34 全绿，build 无回归。
- **结论**：核心交互逻辑（健康状态色判定、Store 全部 action、QaList 紧急置顶排序、Feed/QA 的 Tab/分类/搜索过滤、mockApi 分页、关键组件渲染）**全部验证通过，无缺陷，可交付**。
