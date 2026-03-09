import { Productos } from './productos.js';

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
  return producto.precio_en_descuento ?? producto.precio;
}

function obtenerEstadoPedido(items) {
  const tieneDescuento = items.some((item) => item.precio_en_descuento);
  return tieneDescuento ? 'activo' : 'adquirido';
}

function obtenerClaseBadge(estado) {
  return estado === 'adquirido' ? 'badge-adquirido' : 'badge-activo';
}

function generarFecha(index) {
  const dia = String((index % 28) + 1).padStart(2, '0');
  const mes = String(((index % 12) + 1)).padStart(2, '0');
  return `${dia}/${mes}/2026`;
}

function agruparProductosEnPedidos(productos, cantidadPorPedido = 2) {
  const pedidosAgrupados = [];

  for (let i = 0; i < productos.length; i += cantidadPorPedido) {
    const items = productos.slice(i, i + cantidadPorPedido);
    const indexPedido = pedidosAgrupados.length;

    const subtotal = items.reduce((acc, item) => acc + obtenerPrecioFinal(item), 0);
    const total = subtotal;
    const estado = obtenerEstadoPedido(items);

    pedidosAgrupados.push({
      id: 10234 + indexPedido,
      fecha: generarFecha(indexPedido),
      estado,
      items,
      subtotal,
      total
    });
  }

  return pedidosAgrupados;
}

function renderLista(lista) {
  pedidosLista.innerHTML = '';

  if (!lista.length) {
    pedidosLista.innerHTML = `
      <article class="pedido-card">
        <div>
          <div class="pedido-id">Sin resultados</div>
          <div class="meta">No se encontraron pedidos.</div>
        </div>
      </article>
    `;
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
    const nombres = pedido.items.map((item) => item.nombre.toLowerCase()).join(' ');
    const categorias = pedido.items.map((item) => item.categoria.toLowerCase()).join(' ');

    return (
      id.includes(valor) ||
      fecha.includes(valor) ||
      nombres.includes(valor) ||
      categorias.includes(valor)
    );
  });

  renderLista(pedidosFiltrados);

  if (pedidosFiltrados.length > 0) {
    renderDetalle(pedidosFiltrados[0]);
  }
}

async function initPedidos() {
  const data = await Productos();
  const productos = data.productos || [];

  pedidos = agruparProductosEnPedidos(productos, 2);
  pedidosFiltrados = [...pedidos];

  renderLista(pedidosFiltrados);

  if (pedidosFiltrados.length > 0) {
    renderDetalle(pedidosFiltrados[0]);
  }
}

searchInput.addEventListener('input', (e) => {
  filtrarPedidos(e.target.value);
});

initPedidos();