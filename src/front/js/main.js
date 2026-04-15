import { initHeaderStore } from '/src/front/js/header-store.js';
import { initCarrito } from '/src/front/js/carrito.js';

function injectHTML(url, tag, callback) {
  const element = document.getElementById(tag);
  if (!element) return;

  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      return response.text();
    })
    .then(htmlString => {
      element.innerHTML = htmlString;

      if (typeof callback === 'function') {
        callback();
      }
    })
    .catch(error => {
      console.error(`Error fetching ${url}:`, error);
    });
}

document.addEventListener('DOMContentLoaded', () => {
  injectHTML('/src/front/components/footer.html', 'footer');
  injectHTML('/src/front/components/header-store.html', 'header-store', initHeaderStore);
  injectHTML('/src/front/components/carrito-panel.html', 'carrito', initCarrito);
});

window.addEventListener('storage', () => {
  injectHTML('/src/front/components/header-store.html', 'header-store', initHeaderStore);
  initCarrito();
});