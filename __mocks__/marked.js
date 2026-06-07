// Mock for marked module
const marked = jest.fn().mockImplementation((text) => `<p>${text}</p>`);
marked.setOptions = jest.fn();

module.exports = { marked };