import '@testing-library/jest-dom/vitest';

// jsdom does not implement matchMedia; components use it for responsive logic.
if (!window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

// structuredClone is used by MemoryRepository.
if (typeof globalThis.structuredClone !== 'function') {
  globalThis.structuredClone = ((value: unknown) =>
    JSON.parse(JSON.stringify(value))) as <T>(v: T) => T;
}
