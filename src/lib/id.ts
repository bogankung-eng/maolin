/**
 * 全站唯一 ID 生成入口（工程 E4）。
 * 统一返回 `id_` + 8 位 base36，与 V1~V4 种子 id 格式兼容。
 * 其余文件（mock/data、api/local、lib/mockApi、store）一律 import 此处，禁止散写实现。
 */
export function genId(): string {
  return 'id_' + Math.random().toString(36).slice(2, 10);
}
