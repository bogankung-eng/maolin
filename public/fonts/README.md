# 字体 self-host 目录（工程 E2）

将以下 woff2 文件放入本目录即可启用自托管中文字体（`index.html` 已做 preload，`src/index.css` 已写 `@font-face`）：

- `noto-sans-sc-400.woff2`
- `noto-sans-sc-500.woff2`
- `noto-sans-sc-700.woff2`

来源建议：Google Fonts / Noto Sans SC 官方子集化产物（中文需按 unicode-range 子集化后合并）。

> 若暂未放入字体文件：浏览器会 404 后回退到 `system-ui`（system-ui / 苹方 / 微软雅黑等），
> 可访问性优先、视觉略降，属可接受临时态（见 V3 设计 §9.3）。
