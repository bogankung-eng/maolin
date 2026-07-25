import { describe, it, expect } from 'vitest';
import { getFeedPage } from '@/lib/mockApi';
import { seedPosts } from '@/mock/data';

/**
 * 验证 mockApi.getFeedPage 的分页契约：
 * - 连续取 page=1,2（size=6）
 * - 返回数量正确、两页无重叠、末页不足 size
 *
 * 注意：当前工程师实现为恒返回 [] 的占位 stub（见 src/lib/mockApi.ts），
 * 因此以下断言会失败——这是源码缺陷，已回传工程师修复。
 */
describe('getFeedPage 分页', () => {
  it('page=1,size=6 返回前 6 条且数量正确', async () => {
    const page1 = await getFeedPage(1, 6);
    expect(page1.length).toBe(6);
    const ids1 = page1.map((p) => p.id);
    const expected = seedPosts.slice(0, 6).map((p) => p.id);
    expect(ids1).toEqual(expected);
  });

  it('page=2,size=6 返回剩余且不重叠', async () => {
    const page1 = await getFeedPage(1, 6);
    const page2 = await getFeedPage(2, 6);
    const ids1 = page1.map((p) => p.id);
    const ids2 = page2.map((p) => p.id);

    // 两页无重叠
    expect(ids2.filter((id) => ids1.includes(id))).toEqual([]);
    // 末页不足 size 但非空（共 7 条种子帖子）
    expect(page2.length).toBeGreaterThan(0);
    expect(page2.length).toBeLessThanOrEqual(6);
  });
});
