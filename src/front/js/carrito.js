import { getActiveUserId, requireActiveUser } from "./api-user.js";

let carrito = [];

function getCartElements() {
  return {
    cartItems: document.getElementById('cart-items'),
    cartTotals: document.getElementById('cart-totals'),
    cartPanel: document.getElementById('cart-panel'),
    closeCartBtn: document.getElementById('close-cart-btn')
  };
}

function formatearCRC(valor) {
  return `₡${Number(valor).toLocaleString('es-CR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

function obtenerPrecioFinal(producto) {
  return producto.precio_en_descuento ?? producto.precio ?? 0;
}

async function cargarCarritoDesdeAPI() {
  const userId = getActiveUserId();

  if (!userId) {
    carrito = [];
    return;
  }

  try {
    const response = await fetch(`http://localhost:3000/api/cart/${userId}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Error cargando carrito");
    }

    carrito = data.cart?.items || [];
  } catch (error) {
    console.error("Error leyendo carrito desde API:", error);
    carrito = [];
  }
}

function calcularSubtotal() {
  return carrito.reduce((acc, item) => {
    return acc + (obtenerPrecioFinal(item) * item.cantidad);
  }, 0);
}

function renderTotales() {
  const { cartTotals } = getCartElements();
  if (!cartTotals) return;

  const subtotal = calcularSubtotal();
  const total = subtotal;

  cartTotals.innerHTML = `
    <div class="row">
      <span>Subtotal</span>
      <span>${formatearCRC(subtotal)}</span>
    </div>

    <div class="row muted">
      <span>Envío</span>
      <span>Calculado en el pago.</span>
    </div>

    <div class="row total">
      <span>Total</span>
      <span>${formatearCRC(total)}</span>
    </div>
  `;
}

async function aumentarCantidad(index) {
  const userId = getActiveUserId();
  if (!userId || !carrito[index]) return;

  const item = carrito[index];

  await fetch(`http://localhost:3000/api/cart/${userId}/item/${item._id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      cantidad: item.cantidad + 1
    })
  });

  await renderCarrito();
}

async function disminuirCantidad(index) {
  const userId = getActiveUserId();
  if (!userId || !carrito[index]) return;

  const item = carrito[index];

  if (item.cantidad > 1) {
    await fetch(`http://localhost:3000/api/cart/${userId}/item/${item._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        cantidad: item.cantidad - 1
      })
    });
  } else {
    await fetch(`http://localhost:3000/api/cart/${userId}/item/${item._id}`, {
      method: "DELETE"
    });
  }

  await renderCarrito();
}

function renderMensajeSinSesion() {
  const { cartItems } = getCartElements();
  if (!cartItems) return;

  cartItems.innerHTML = `
    <article class="cart-item">
      <div class="info">
        <div class="name">Debes iniciar sesión</div>
        <div class="price">Inicia sesión para usar tu carrito personal.</div>
      </div>
    </article>
  `;

  renderTotales();
}

async function renderCarrito() {
  const { cartItems } = getCartElements();
  if (!cartItems) return;

  if (!getActiveUserId()) {
    carrito = [];
    renderMensajeSinSesion();
    return;
  }

  await cargarCarritoDesdeAPI();

  if (!carrito.length) {
    cartItems.innerHTML = `
      <article class="cart-item">
        <div class="info">
          <div class="name">Tu carrito está vacío</div>
          <div class="price">Agrega productos para continuar.</div>
        </div>
      </article>
    `;

    renderTotales();
    return;
  }

  cartItems.innerHTML = carrito.map((producto, index) => `
    <article class="cart-item">
      <div class="thumb">
        <img
          src="${producto.thumbnail || producto.imagen || '/assets/Logo_4bit.webp'}"
          alt="${producto.nombre}"
          loading="lazy"
          onerror="this.onerror=null; this.src='/assets/Logo_4bit.webp';"
        />
      </div>

      <div class="info">
        <div class="name">${producto.nombre}</div>
        <div class="price">${formatearCRC(obtenerPrecioFinal(producto))}</div>
      </div>

      <div class="qty-box">
        <button
          class="qty-btn"
          type="button"
          data-action="minus"
          data-index="${index}">
          −
        </button>

        <span>${producto.cantidad}</span>

        <button
          class="qty-btn"
          type="button"
          data-action="plus"
          data-index="${index}">
          +
        </button>
      </div>
    </article>
  `).join('');

  renderTotales();
}

function agregarEventosCantidad() {
  const { cartItems } = getCartElements();
  if (!cartItems || cartItems.dataset.eventsLoaded === 'true') return;

  cartItems.addEventListener('click', async (e) => {
    const button = e.target.closest('.qty-btn');
    if (!button) return;

    const index = Number(button.dataset.index);
    const action = button.dataset.action;

    if (action === 'plus') {
      await aumentarCantidad(index);
    }

    if (action === 'minus') {
      await disminuirCantidad(index);
    }
  });

  cartItems.dataset.eventsLoaded = 'true';
}

function agregarEventoConfirmar() {
  const confirmBtn = document.getElementById('cart-confirm-btn');
  if (!confirmBtn || confirmBtn.dataset.eventsLoaded === 'true') return;

  confirmBtn.addEventListener('click', async () => {
    const user = requireActiveUser();
    if (!user) return;

    await cargarCarritoDesdeAPI();

    if (!carrito.length) {
      alert('Tu carrito está vacío.');
      return;
    }

    window.location.href = '/src/front/pages/checkout.html';
  });

  confirmBtn.dataset.eventsLoaded = 'true';
}

export async function agregarProductoAlCarrito(producto, cantidad = 1) {
  const user = requireActiveUser();
  if (!user) return;

  try {
    const response = await fetch(`http://localhost:3000/api/cart/${user.id || user._id}/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        productId: producto._id,
        cantidad
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "No se pudo agregar al carrito");
    }

    alert(`"${producto.nombre}" fue agregado al carrito.`);
    await renderCarrito();
  } catch (error) {
    console.error("Error agregando producto al carrito:", error);
    alert("No se pudo agregar el producto al carrito.");
  }
}

export async function obtenerCarritoActual() {
  await cargarCarritoDesdeAPI();
  return carrito;
}

export async function limpiarCarritoActual() {
  const userId = getActiveUserId();
  if (!userId) return;

  await fetch(`http://localhost:3000/api/cart/${userId}/clear`, {
    method: "DELETE"
  });

  carrito = [];
  await renderCarrito();
}

export function abrirCarrito() {
  const { cartPanel } = getCartElements();
  if (!cartPanel) return;

  renderCarrito();
  cartPanel.classList.add('is-open');
}

export function cerrarCarrito() {
  const { cartPanel } = getCartElements();
  if (!cartPanel) return;

  cartPanel.classList.remove('is-open');
}

function agregarEventosModal() {
  const { cartPanel, closeCartBtn } = getCartElements();

  if (closeCartBtn && closeCartBtn.dataset.eventsLoaded !== 'true') {
    closeCartBtn.addEventListener('click', cerrarCarrito);
    closeCartBtn.dataset.eventsLoaded = 'true';
  }

  if (cartPanel && cartPanel.dataset.eventsLoaded !== 'true') {
    cartPanel.addEventListener('click', (e) => {
      if (e.target === cartPanel) {
        cerrarCarrito();
      }
    });

    cartPanel.dataset.eventsLoaded = 'true';
  }

  if (!document.body.dataset.cartEscapeLoaded) {
    document.addEventListener('keydown', (e) => {
      const { cartPanel: currentPanel } = getCartElements();

      if (e.key === 'Escape' && currentPanel?.classList.contains('is-open')) {
        cerrarCarrito();
      }
    });

    document.body.dataset.cartEscapeLoaded = 'true';
  }
}

export function initCarrito() {
  const { cartItems, cartTotals, cartPanel } = getCartElements();
  if (!cartItems || !cartTotals || !cartPanel) return;

  agregarEventosCantidad();
  agregarEventosModal();
  agregarEventoConfirmar();
  renderCarrito();
}