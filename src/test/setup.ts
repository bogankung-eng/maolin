import '@testing-library/jest-dom';

// jsdom 未实现 IntersectionObserver，而 FeedList 用它做触底加载。
// 提供空实现，避免渲染组件时崩溃。
class MockIntersectionObserver {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

// @ts-expect-error 注入全局 mock（jsdom 无此 API）
globalThis.IntersectionObserver = MockIntersectionObserver;
