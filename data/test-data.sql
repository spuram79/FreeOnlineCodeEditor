-- Test database schema and sample test data
-- Run this file to set up test data

INSERT INTO chat_sessions (id, title, model, focus_mode, created_at, updated_at) VALUES
  ('test-session-1', 'What is the weather today?', 'openrouter/free', NULL, 1717734400000, 1717734400000),
  ('test-session-2', 'Explain quantum computing', 'openrouter/auto', 'academic', 1717734400000, 1717734400000),
  ('test-session-3', 'Write a Python function', 'openrouter/free', 'coding', 1717734400000, 1717734400000),
  ('test-session-4', 'Help with math homework', 'openrouter/auto', 'math', 1717734400000, 1717734400000),
  ('test-session-5', 'Write creative story', 'openrouter/free', 'writing', 1717734400000, 1717734400000);

INSERT INTO messages (session_id, role, content, created_at) VALUES
  ('test-session-1', 'user', 'What is the weather today?', 1717734400000),
  ('test-session-1', 'assistant', 'I would need to know your location to provide weather information. Could you please tell me where you are located?', 1717734401000),
  ('test-session-2', 'user', 'Can you explain quantum computing in simple terms?', 1717734400000),
  ('test-session-2', 'assistant', 'Quantum computing is a type of computing that uses quantum bits or qubits, which can exist in multiple states simultaneously thanks to superposition. This allows quantum computers to solve certain problems much faster than classical computers.', 1717734401000),
  ('test-session-3', 'user', 'Write a Python function to calculate fibonacci numbers', 1717734400000),
  ('test-session-3', 'assistant', 'Here is a Python function to calculate Fibonacci numbers:', 1717734401000),
  ('test-session-3', 'assistant', 'def fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n - 1) + fibonacci(n - 2)', 1717734402000);

-- Sample test session for deletion testing
INSERT INTO chat_sessions (id, title, model, focus_mode, created_at, updated_at) VALUES
  ('test-delete-session', 'This session will be deleted', 'openrouter/free', NULL, 1717734400000, 1717734400000);

INSERT INTO messages (session_id, role, content, created_at) VALUES
  ('test-delete-session', 'user', 'Test message for deletion', 1717734400000),
  ('test-delete-session', 'assistant', 'This will be deleted', 1717734401000);