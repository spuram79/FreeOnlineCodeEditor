import '@testing-library/jest-dom';

// Mock for marked module (ESM named export)
jest.mock('marked', () => ({
  marked: jest.fn().mockImplementation((text) => `<p>${text}</p>`),
  setOptions: jest.fn(),
}));

// Mock for prismjs
jest.mock('prismjs', () => ({
  highlightElement: jest.fn(),
}));

// Mock for prismjs language imports
jest.mock('prismjs/components/prism-javascript', () => jest.fn());
jest.mock('prismjs/components/prism-typescript', () => jest.fn());
jest.mock('prismjs/components/prism-jsx', () => jest.fn());
jest.mock('prismjs/components/prism-tsx', () => jest.fn());
jest.mock('prismjs/components/prism-css', () => jest.fn());
jest.mock('prismjs/components/prism-python', () => jest.fn());
jest.mock('prismjs/components/prism-java', () => jest.fn());
jest.mock('prismjs/components/prism-c', () => jest.fn());
jest.mock('prismjs/components/prism-cpp', () => jest.fn());
jest.mock('prismjs/components/prism-sql', () => jest.fn());
jest.mock('prismjs/components/prism-bash', () => jest.fn());
jest.mock('prismjs/components/prism-json', () => jest.fn());
jest.mock('prismjs/components/prism-markdown', () => jest.fn());