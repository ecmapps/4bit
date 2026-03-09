const pedidosLista = document.getElementById('pedidos-lista');
const pedidoDetail = document.getElementById('pedido-detail');
const searchInput = document.getElementById('searchPedidos');

let pedidos = [];
let pedidosFiltrados = [];

function formatearCRC(valor) {
  return `₡${Number(valor).toLocaleString('es-CR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

function obtenerPrecioFinal(producto) {
  return producto.precio_en_descuento ?? producto.precio ?? 0;
}

function obtenerClaseBadge(estado) {
  return estado === 'adquirido' ? 'badge-adquirido' : 'badge-activo';
}

function cargarPedidosDesdeStorage() {
  try {
    const data = localStorage.getItem('4bit_orders');
    pedidos = data ? JSON.parse(data) : [];
    pedidosFiltrados = [...pedidos];
  } catch (error) {
    console.error('Error cargando pedidos:', error);
    pedidos = [];
    pedidosFiltrados = [];
  }
}

function renderLista(lista) {
  if (!pedidosLista) return;

  pedidosLista.innerHTML = '';

  if (!lista.length) {
    pedidosLista.innerHTML = `
      <article class="pedido-card">
        <div>
          <div class="pedido-id">Sin pedidos</div>
          <div class="meta">Aún no tienes compras registradas.</div>
        </div>
      </article>
    `;

    if (pedidoDetail) {
      pedidoDetail.innerHTML = `
        <div class="header">
          <h2>Sin pedidos</h2>
        </div>
        <div class="box">
          <div class="section-title">Detalle del Pedido</div>
          <p>No hay información para mostrar todavía.</p>
        </div>
      `;
    }

    return;
  }

  lista.forEach((pedido, index) => {
    const claseBadge = obtenerClaseBadge(pedido.estado);

    const card = document.createElement('article');
    card.className = 'pedido-card';

    card.innerHTML = `
      <div>
        <div class="pedido-id">Pedido #${pedido.id}</div>
        <div class="meta">
          Fecha: ${pedido.fecha}<br />
          Total: ${formatearCRC(pedido.total)}
        </div>
      </div>

      <div style="display:grid; gap:.5rem; justify-items:end;">
        <span class="${claseBadge}">${pedido.estado.toUpperCase()}</span>
        <button class="btn-grad-secondary btn-sm" type="button">
          Ver Detalle
        </button>
      </div>
    `;

    const boton = card.querySelector('button');
    boton.addEventListener('click', () => {
      renderDetalle(pedido);
    });

    pedidosLista.appendChild(card);

    if (index === 0) {
      renderDetalle(pedido);
    }
  });
}

function renderDetalle(pedido) {
  if (!pedidoDetail) return;

  const claseBadge = obtenerClaseBadge(pedido.estado);

  const itemsHTML = pedido.items.map((producto) => {
    const estadoItem = producto.precio_en_descuento ? 'activo' : 'adquirido';
    const claseBadgeItem = obtenerClaseBadge(estadoItem);

    return `
      <div class="item">
        <div class="thumb">
          <img
            src="${producto.thumbnail || producto.imagen || '/assets/Logo_4bit.webp'}"
            alt="${producto.nombre}"
            loading="lazy"
            onerror="this.onerror=null; this.src='/assets/Logo_4bit.webp';"
          />
        </div>

        <div>
          <div class="name">${producto.nombre}</div>
          <div class="desc">${formatearCRC(obtenerPrecioFinal(producto))}</div>
          <div class="desc">Cantidad: ${producto.cantidad || 1}</div>
        </div>

        <div class="actions">
          <button class="btn-grad-secondary btn-xs" type="button">
            Descargar
          </button>
          <span class="${claseBadgeItem}">${estadoItem.toUpperCase()}</span>
        </div>
      </div>
    `;
  }).join('');

  pedidoDetail.innerHTML = `
    <div class="header">
      <h2>Pedido #${pedido.id}</h2>
    </div>

    <div class="detail-meta">
      <span class="date">Fecha: ${pedido.fecha}</span>
      <span class="${claseBadge}">${pedido.estado.toUpperCase()}</span>
    </div>

    <div class="steps">
      <div class="step done">
        <div class="dot">✓</div>
        Pago realizado
      </div>
      <div class="step done">
        <div class="dot">✓</div>
        Confirmado
      </div>
      <div class="step done">
        <div class="dot">✓</div>
        Licencia generada
      </div>
      <div class="step done">
        <div class="dot">✓</div>
        Acceso activado
      </div>
    </div>

    <div class="box">
      <div class="section-title">Detalle del Pedido</div>

      ${itemsHTML}

      <div class="totals">
        <div class="row">
          <span>Subtotal</span>
          <span>${formatearCRC(pedido.subtotal)}</span>
        </div>
        <div class="row muted">
          <span>Envío</span>
          <span>Calculado en el pago.</span>
        </div>
        <div class="row total">
          <span>Total</span>
          <span>${formatearCRC(pedido.total)}</span>
        </div>
      </div>
    </div>
  `;
}

function filtrarPedidos(texto) {
  const valor = texto.trim().toLowerCase();

  pedidosFiltrados = pedidos.filter((pedido) => {
    const id = String(pedido.id).toLowerCase();
    const fecha = pedido.fecha.toLowerCase();
    const metodo = (pedido.metodoPago || '').toLowerCase();
    const nombres = pedido.items.map((item) => item.nombre.toLowerCase()).join(' ');
    const categorias = pedido.items.map((item) => item.categoria.toLowerCase()).join(' ');

    return (
      id.includes(valor) ||
      fecha.includes(valor) ||
      metodo.includes(valor) ||
      nombres.includes(valor) ||
      categorias.includes(valor)
    );
  });

  renderLista(pedidosFiltrados);

  if (pedidosFiltrados.length > 0) {
    renderDetalle(pedidosFiltrados[0]);
  }
}

function initPedidos() {
  cargarPedidosDesdeStorage();
  renderLista(pedidosFiltrados);

  if (pedidosFiltrados.length > 0) {
    renderDetalle(pedidosFiltrados[0]);
  }
}

searchInput?.addEventListener('input', (e) => {
  filtrarPedidos(e.target.value);
});

document.addEventListener('DOMContentLoaded', initPedidos);