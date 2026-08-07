# 毛邻宠物社区 项目日志

> 项目日志记录质量保障相关的工作（Bug、测试、覆盖率、优化）。

---

## 2026-08-04 质量保障专项

### ✅ 测试规模：34 → 80 用例全绿
新增 4 个测试文件 46 用例，覆盖此前 0% 的薄弱区：

| 文件 | 用例数 | 覆盖内容 |
| --- | --- | --- |
| `src/__tests__/publishSheet.test.tsx` | 8 | 发布弹层：发帖/提问双模式、空内容拦截（store toast 断言）、>50字标题截断、分类切换、成功置顶+清空、取消不改数据 |
| `src/__tests__/profilePage.test.tsx` | 13 | 我的页：用户信息/统计/宠物/健康记录/九宫格、addPet 双 prompt 流程、HealthRecordList 空态与状态徽标、PetCard 渲染与 onClick |
| `src/__tests__/detailPages.test.tsx` | 9 | 帖子详情（不存在态/作者/点赞/评论输入/空评论占位）+ 问答详情（标题/空回答拦截/提交回答） |
| `src/__tests__/commonComponents.test.tsx` | 16 | Button（3 变体/disabled）、Badge（tone 映射）、Avatar（emoji/img/size）、Icon、BottomSheet（动画关闭时序 fake timers）、Toast |
| `src/__tests__/persist.test.ts` | 5 | Zustand persist：partialize 只存 4 数据字段、新会话 hydrate 恢复、resetStore 回种子态、视图态不入库、脏数据容错 |

### 📊 覆盖率（2026-08-04 配置后实测）
- **函数覆盖 89.33% / 语句 86.05% / 分支 59.18%**（目标函数 ≥80% ✅）
- 高覆盖：store 99.03%、qa 100%、layout 82.7%
- 中等：feed 69.7%、lib 73.07%
- 分支覆盖率偏低（UI 条件分支多），后续可针对性补分支断言

### 🔧 基础设施
- `@vitest/coverage-v8@2.1.9`（⚠️ 必须匹配 vitest 2.x，装 4.x 会 ERESOLVE 冲突）
- `vitest.config.ts` 加 coverage 段（v8 / `clean: false` 避开 safe-delete 拦截 / include src / exclude test/types/mock/main）
- `scripts/parse-coverage.cjs`：解析 `coverage/.tmp/*.json` 出汇总报告
- HTML 报告在 `coverage/`（用浏览器打开 `coverage/index.html`）

### 🐛 测试中发现并修正的假设（非源码 bug）
- Toast 由 AppShell 挂载 → 单测断言 `store.toast` 而非 DOM
- `addPet` 追加到数组**末尾**（断言 pets[3] 而非 pets[0]）
- Avatar 的 img 无 alt 无 role → 用 `document.querySelector('img')` 断言

### 🔒 依赖审计（2026-08-04）
- react-router / react-router-dom 2 个 **moderate**：open redirect + XSS（CVE-2025-68470 bypass、deserializeErrors）
- 建议：升级 react-router-dom 至 6.x 最新补丁版（本环境 npm 网络受限，待联网执行）

### ⚠️ 测试运行注意
- 本机 safe-delete 会拦截 `coverage/` 目录清理 → vitest 配置已加 `clean: false`；手动清理用 PowerShell
- `npm run test`（= vitest run）；带覆盖率：`npm run test -- --coverage`

---

## 历史
- 2026-07-18：V1 完成，34 用例全绿；ML-001（getFeedPage 分页）已闭环，详见 TEST_REPORT.md

_最后更新：2026-08-04_
