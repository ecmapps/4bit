import { getActiveUserId, requireActiveUser } from "./api-user.js";
import { obtenerImagenProducto, getImageFallbackAttr } from "./images.js";

const checkoutItems = document.getElementById('checkout-items');
const checkoutTotals = document.getElementById('checkout-totals');
const checkoutForm = document.getElementById('checkout-form');
const paymentFields = document.getElementById('payment-fields');

let carrito = [];

function formatearCRC(valor) {
  return `₡${Number(valor).toLocaleString('es-CR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

function obtenerPrecioFinal(producto) {
  return producto.precio_en_descuento ?? producto.precio ?? 0;
}

async function cargarCarrito() {
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
    console.error('Error cargando carrito:', error);
    carrito = [];
  }
}

function calcularSubtotal() {
  return carrito.reduce((acc, item) => {
    return acc + (obtenerPrecioFinal(item) * item.cantidad);
  }, 0);
}

function renderItems() {
  if (!checkoutItems) return;

  if (!carrito.length) {
    checkoutItems.innerHTML = `
      <div class="alert alert-light mb-0">
        No hay productos en el carrito.
      </div>
    `;
    return;
  }

  checkoutItems.innerHTML = carrito.map(producto => `
    <div class="d-flex gap-3 align-items-center border rounded-3 p-2">
      <img
      src="${obtenerImagenProducto(producto)}"
        alt="${producto.nombre}"
        style="width:70px; height:70px; object-fit:contain;"
        onerror="${getImageFallbackAttr()}"
      />

      <div class="flex-grow-1">
        <div class="fw-bold">${producto.nombre}</div>
        <div class="text-muted small">Cantidad: ${producto.cantidad}</div>
      </div>

      <div class="fw-semibold">
        ${formatearCRC(obtenerPrecioFinal(producto) * producto.cantidad)}
      </div>
    </div>
  `).join('');
}

function renderTotales() {
  if (!checkoutTotals) return;

  const subtotal = calcularSubtotal();
  const total = subtotal;

  checkoutTotals.innerHTML = `
    <div class="d-flex justify-content-between mb-2">
      <span>Subtotal</span>
      <span>${formatearCRC(subtotal)}</span>
    </div>

    <div class="d-flex justify-content-between mb-2 text-muted">
      <span>Envío</span>
      <span>Calculado en el pago.</span>
    </div>

    <div class="d-flex justify-content-between fw-bold fs-5">
      <span>Total</span>
      <span>${formatearCRC(total)}</span>
    </div>
  `;
}

function renderCamposPago(metodo) {
  if (!paymentFields) return;

  if (metodo === 'tarjeta') {
    paymentFields.innerHTML = `
      <div class="row g-3">
        <div class="col-md-12">
          <label class="form-label">Nombre del titular</label>
          <input type="text" class="form-control" required>
        </div>
        <div class="col-md-12">
          <label class="form-label">Número de tarjeta</label>
          <input type="text" class="form-control" required>
        </div>
        <div class="col-md-6">
          <label class="form-label">Vencimiento</label>
          <input type="text" class="form-control" required>
        </div>
        <div class="col-md-6">
          <label class="form-label">CVV</label>
          <input type="text" class="form-control" required>
        </div>
      </div>
    `;
    return;
  }

  if (metodo === 'sinpe') {
    paymentFields.innerHTML = `
      <div>
        <label class="form-label">Número SINPE</label>
        <input type="text" class="form-control" required>
      </div>
    `;
    return;
  }

  paymentFields.innerHTML = `
    <div>
      <label class="form-label">Correo de PayPal</label>
      <input type="email" class="form-control" required>
    </div>
  `;
}

function agregarEventosMetodoPago() {
  const radios = document.querySelectorAll('input[name="metodoPago"]');

  radios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      renderCamposPago(e.target.value);
    });
  });
}

function agregarEventoSubmit() {
  if (!checkoutForm || checkoutForm.dataset.eventsLoaded === "true") return;

  checkoutForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const user = requireActiveUser();
    if (!user) return;

    if (!carrito.length) {
      alert('No hay productos en el carrito.');
      return;
    }

    const metodoPagoSeleccionado =
      document.querySelector('input[name="metodoPago"]:checked')?.value || 'tarjeta';
      console.log('user id en checkout:', getActiveUserId());
      let items = carrito.map(item => ({
        productId: item._id,
        quantity: item.cantidad
      }));
      console.log('items a enviar en checkout:', items);
    try {
      const response = await fetch('http://localhost:3000/api/orders', {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId: getActiveUserId(),
          items: items,
          metodoPago: metodoPagoSeleccionado
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "No se pudo crear el pedido");
      }

      alert('Pago realizado correctamente.');
      window.location.href = '/src/front/pages/pedidos.html';
    } catch (error) {
      console.error('Error guardando pedido:', error);
      alert('No se pudo completar la compra.');
    }
  });

  checkoutForm.dataset.eventsLoaded = "true";
}

async function initCheckout() {
  const user = requireActiveUser();
  if (!user) return;

  await cargarCarrito();
  renderItems();
  renderTotales();
  renderCamposPago('tarjeta');
  agregarEventosMetodoPago();
  agregarEventoSubmit();
}

document.addEventListener('DOMContentLoaded', initCheckout);