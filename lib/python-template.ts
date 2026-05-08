export const defaultPython = `# Welcome to Poolside Python Editor!
# Python runs in your browser using Pyodide

def greet(name):
    return f"Hello, {name}! Welcome to Python on Poolside!"

# Print greeting
print(greet("Developer"))

# Simple calculation
result = sum([i**2 for i in range(10)])
print(f"Sum of squares 0-9: {result}")

# Fibonacci sequence
def fibonacci(n):
    a, b = 0, 1
    for _ in range(n):
        yield a
        a, b = b, a + b

print("Fibonacci sequence:")
print(list(fibonacci(10)))`;