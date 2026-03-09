import { auth } from '/src/front/js/auth.js';
import { abrirCarrito } from '/src/front/js/carrito.js';

export function initHeaderStore() {
  const userSection = document.getElementById('store-user-section');
  if (!userSection) return;

  const activeUser = auth.getActiveUser();

  if (activeUser) {
    userSection.innerHTML = `
      <div class="navbar-store__user-box">
        <span class="navbar-store__username">👤 ${activeUser.fullname}</span>

        <button
          class="navbar-store__cart-btn"
          id="open-cart-btn"
          type="button">
          🛒 Carrito
        </button>

        <button
          class="navbar-store__logout-btn"
          id="logout-btn"
          type="button">
          Salir
        </button>
      </div>
    `;

    const openCartBtn = document.getElementById('open-cart-btn');
    if (openCartBtn) {
      openCartBtn.addEventListener('click', abrirCarrito);
    }

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        auth.logout();
        window.location.reload();
      });
    }
  } else {
    userSection.innerHTML = `
      <a href="/src/front/pages/login.html"
         class="btn-grad-secondary navbar-store__login">
        Iniciar Sesión
      </a>
    `;
  }
}