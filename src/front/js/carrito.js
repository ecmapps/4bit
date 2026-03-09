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

function cargarCarritoDesdeStorage() {
  try {
    const carritoGuardado = localStorage.getItem('4bit_cart');
    carrito = carritoGuardado ? JSON.parse(carritoGuardado) : [];
  } catch (error) {
    console.error('Error leyendo carrito desde localStorage:', error);
    carrito = [];
  }
}

function guardarCarritoEnStorage() {
  localStorage.setItem('4bit_cart', JSON.stringify(carrito));
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

function aumentarCantidad(index) {
  if (!carrito[index]) return;

  carrito[index].cantidad += 1;
  guardarCarritoEnStorage();
  renderCarrito();
}

function disminuirCantidad(index) {
  if (!carrito[index]) return;

  if (carrito[index].cantidad > 1) {
    carrito[index].cantidad -= 1;
  } else {
    carrito.splice(index, 1);
  }

  guardarCarritoEnStorage();
  renderCarrito();
}

function renderCarrito() {
  const { cartItems } = getCartElements();
  if (!cartItems) return;

  cargarCarritoDesdeStorage();

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

  cartItems.addEventListener('click', (e) => {
    const button = e.target.closest('.qty-btn');
    if (!button) return;

    const index = Number(button.dataset.index);
    const action = button.dataset.action;

    if (action === 'plus') {
      aumentarCantidad(index);
    }

    if (action === 'minus') {
      disminuirCantidad(index);
    }
  });

  cartItems.dataset.eventsLoaded = 'true';
}

function agregarEventoConfirmar() {
  const confirmBtn = document.getElementById('cart-confirm-btn');
  if (!confirmBtn || confirmBtn.dataset.eventsLoaded === 'true') return;

  confirmBtn.addEventListener('click', () => {
    cargarCarritoDesdeStorage();

    if (!carrito.length) {
      alert('Tu carrito está vacío.');
      return;
    }

    window.location.href = '/src/front/pages/checkout.html';
  });

  confirmBtn.dataset.eventsLoaded = 'true';
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