import { Productos } from './productos.js';

const cartItems = document.getElementById('cart-items');
const cartTotals = document.getElementById('cart-totals');

let carrito = [];

function formatearCRC(valor) {
  return `₡${Number(valor).toLocaleString('es-CR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

function obtenerPrecioFinal(producto) {
  return producto.precio_en_descuento ?? producto.precio;
}

function calcularSubtotal() {
  return carrito.reduce((acc, item) => {
    return acc + (obtenerPrecioFinal(item) * item.cantidad);
  }, 0);
}

function renderTotales() {
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
  carrito[index].cantidad += 1;
  renderCarrito();
}

function disminuirCantidad(index) {
  if (carrito[index].cantidad > 1) {
    carrito[index].cantidad -= 1;
  } else {
    carrito.splice(index, 1);
  }

  renderCarrito();
}

function renderCarrito() {
  if (!cartItems) return;

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
        <button class="qty-btn" type="button" data-action="minus" data-index="${index}">−</button>
        <span>${producto.cantidad}</span>
        <button class="qty-btn" type="button" data-action="plus" data-index="${index}">+</button>
      </div>
    </article>
  `).join('');

  renderTotales();
}

function agregarEventosCantidad() {
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
}

async function initCarrito() {
  const data = await Productos();
  const productos = data?.productos || [];

  // Productos de ejemplo
  carrito = productos.slice(0, 2).map((producto) => ({
    ...producto,
    cantidad: 1
  }));

  renderCarrito();
}

if (cartItems && cartTotals) {
  agregarEventosCantidad();
  initCarrito();
}