# src/api 接口约定（工程 E9）

本目录为「数据访问层」契约：组件/页面只通过 `src/api` 暴露的 `api` 单例或同步桥访问数据，禁止直接 `import '@/lib/mockApi'` 或直接操作 `localStorage`。

## 双轨机制

| 模式 | 实现 | 切换方式 |
|---|---|---|
| mock（默认） | `mock.ts` → 包一层 `lib/mockApi`（async 契约 + 300ms 延时） | 默认 |
| fetch（真实后端占位） | `fetch.ts` → 同接口占位，接入后实现 | `.env` 设 `VITE_API_MODE=fetch` |

同步桥（`local.ts`）供 store action 在 mock 模式下即时同步 UI 使用（`insertPostSync` / `insertQuestionSync` / `insertAnswerSync` / `insertCommentSync`），与 `mock.ts` 完全同源（复用 `mock/data.ts` 工厂），保证数据形态一致。

## REST 端点映射

| 端点 | 方法 | 契约方法 | 入参 | 出参 |
|---|---|---|---|---|
| `/posts?page=&size=` | GET | `getFeedPage(page, size)` | `page`、`size` | `Post[]` |
| `/posts` | POST | `insertPost(input)` | `PostInput` | `Post` |
| `/questions` | POST | `insertQuestion(input)` | `QuestionInput` | `Question` |
| `/questions/:id/answers` | POST | `insertAnswer(questionId, input)` | `questionId` + `AnswerInput` | `Answer` |
| `/posts/:id/comments` | POST | `insertComment(postId, content, parentId?)` | `postId`、`content`、`parentId?` | `Comment` |

## 统一响应结构

```json
{
  "code": 0,
  "data": {},
  "message": "ok"
}
```

- `code === 0` 表示成功，其余为业务错误码。
- `data` 为各方法出参对应的实体/数组。
- `message` 为可读提示文案。

## 错误码约定

| code | 含义 |
|---|---|
| 0 | 成功 |
| 400 | 参数校验失败（如 content 为空、petId 非法） |
| 404 | 资源不存在（如 postId 不存在） |
| 500 | 服务端异常 |

> 本期为纯前端 mock，以上结构为「未来接后端」的统一约定，mock 实现不产生真实网络请求。
