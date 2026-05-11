/**
 * Code Editor Feature - Web Templates
 * 
 * Default code templates for HTML, CSS, and JavaScript.
 * Can be moved to a separate project by copying this file.
 */

export const defaultHtml = `<div class="container">
  <h1>Hello, World!</h1>
  <p>Welcome to the Poolside Web Code Editor!</p>
  <button id="myButton">Click Me!</button>
</div>`;

export const defaultCss = `.container {
  max-width: 800px;
  margin: 50px auto;
  padding: 20px;
  text-align: center;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

h1 {
  color: #3b82f6;
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

p {
  color: #6b7280;
  font-size: 1.2rem;
  margin-bottom: 2rem;
}

button {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  border: none;
  padding: 12px 24px;
  font-size: 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(59, 130, 246, 0.3);
}`;

export const defaultJs = `// Add your JavaScript here
console.log('Poolside Web Editor Ready!');

// Add click handler for the button
document.getElementById('myButton')?.addEventListener('click', () => {
  alert('Button clicked!');
});

// Example: Add a clock
const clock = document.createElement('div');
clock.style.marginTop = '2rem';
clock.style.fontSize = '1.5rem';
clock.style.color = '#8b5cf6';
document.querySelector('.container')?.appendChild(clock);

function updateClock() {
  const now = new Date();
  clock.textContent = now.toLocaleTimeString();
}

setInterval(updateClock, 1000);
updateClock();`;