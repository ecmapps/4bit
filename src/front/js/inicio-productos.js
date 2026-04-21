import { Productos } from './productos.js';
import { agregarProductoAlCarrito } from './carrito.js';

const filtrosCategorias = document.getElementById('filtros-categorias');
const filtrosPlataformas = document.getElementById('filtros-plataformas');
const contenedorProductos = document.getElementById('productos-filtrados');
const inputBusqueda = document.getElementById('busqueda-productos');
const resumenProductos = document.getElementById('inicio-resumen-productos');
const btnLeft = document.getElementById('productos-left');
const btnRight = document.getElementById('productos-right');

let productos = [];
let productosFiltrados = [];
let categoriaActiva = 'Todas';
let plataformaActiva = 'Todas';
let textoBusqueda = '';

function formatearCRC(valor) {
  return `₡${Number(valor).toLocaleString('es-CR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

function obtenerPrecioFinal(producto) {
  return producto.precio_en_descuento ?? producto.precio;
}

function obtenerCategoriaTexto(producto) {
  return typeof producto.categoria === "object"
    ? producto.categoria?.nombre || ""
    : producto.categoria || "";
}

async function agregarAlCarrito(producto) {
  await agregarProductoAlCarrito(producto, 1);
}

function renderDetalleProducto(producto) {
  const modalBody = document.getElementById('productoDetalleBody');
  if (!modalBody) return;

  const precioFinal = obtenerPrecioFinal(producto);
  const tieneDescuento =
    producto.precio_en_descuento !== null &&
    producto.precio_en_descuento !== undefined;

  const categoriaTexto = obtenerCategoriaTexto(producto);

  modalBody.innerHTML = `
    <div class="row g-4 align-items-center">
      <div class="col-md-5 text-center">
        <img
          src="${producto.thumbnail || producto.imagen || '/assets/producto-default.png'}"
          alt="${producto.nombre}"
          class="img-fluid"
          style="max-height: 260px; object-fit: contain;"
          onerror="this.onerror=null; this.src='/assets/producto-default.png';"
        >
      </div>

      <div class="col-md-7">
        <h3 class="fw-bold mb-3">${producto.nombre}</h3>

        <p class="mb-2">
          <span class="badge text-bg-dark">${categoriaTexto}</span>
        </p>

        <p class="text-muted mb-3">
          ${producto.descripcion_breve}
        </p>

        <p class="mb-2">
          <strong>Plataformas:</strong>
          ${Array.isArray(producto.sistema_operativo)
            ? producto.sistema_operativo.join(', ')
            : producto.sistema_operativo}
        </p>

        <p class="mb-2">
          <strong>Año de lanzamiento:</strong>
          ${producto.año_de_lanzamiento}
        </p>

        <div class="mb-4">
          ${
            tieneDescuento
              ? `
                <span class="text-decoration-line-through text-muted me-2">
                  ${formatearCRC(producto.precio)}
                </span>
                <span class="fw-bold fs-4 text-success">
                  ${formatearCRC(precioFinal)}
                </span>
              `
              : `
                <span class="fw-bold fs-4">
                  ${formatearCRC(precioFinal)}
                </span>
              `
          }
        </div>

        <button class="btn btn-warning" id="btn-agregar-detalle" type="button">
          Agregar al carrito
        </button>
      </div>
    </div>
  `;

  const btnAgregarDetalle = document.getElementById('btn-agregar-detalle');
  if (btnAgregarDetalle) {
    btnAgregarDetalle.addEventListener('click', async () => {
      await agregarAlCarrito(producto);
    });
  }
}

function renderProductos(lista) {
  if (!contenedorProductos) return;

  if (resumenProductos) {
    resumenProductos.textContent = `${lista.length} producto(s) encontrados`;
  }

  if (!lista.length) {
    contenedorProductos.innerHTML = `
      <div class="alert alert-light w-100 text-center">
        No se encontraron productos con esos filtros.
      </div>
    `;
    return;
  }

  contenedorProductos.innerHTML = lista.map((producto, index) => {
    const precioFinal = obtenerPrecioFinal(producto);
    const tieneDescuento =
      producto.precio_en_descuento !== null &&
      producto.precio_en_descuento !== undefined;

    const categoriaTexto = obtenerCategoriaTexto(producto);

    return `
      <article class="producto-carousel-card">
        <div class="producto-carousel-card__top">
          <img
            src="${producto.thumbnail || producto.imagen || '/assets/producto-default.png'}"
            class="producto-carousel-card__img"
            alt="${producto.nombre}"
            loading="lazy"
            onerror="this.onerror=null; this.src='/assets/producto-default.png';"
          >

          <div class="producto-carousel-card__body">
            <h5 class="producto-carousel-card__title">${producto.nombre}</h5>

            <p class="producto-carousel-card__desc">
              ${producto.descripcion_breve}
            </p>

            <p class="mb-2">
              <span class="badge text-bg-dark">${categoriaTexto}</span>
            </p>

            <p class="producto-carousel-card__platforms">
              <strong>Plataformas:</strong>
              ${Array.isArray(producto.sistema_operativo)
                ? producto.sistema_operativo.join(', ')
                : producto.sistema_operativo}
            </p>
          </div>
        </div>

        <div class="producto-carousel-card__bottom">
          <div class="producto-carousel-card__price">
            ${
              tieneDescuento
                ? `
                  <span class="producto-carousel-card__old-price">${formatearCRC(producto.precio)}</span>
                  <span class="producto-carousel-card__new-price">${formatearCRC(precioFinal)}</span>
                `
                : `
                  <span class="producto-carousel-card__new-price">${formatearCRC(precioFinal)}</span>
                `
            }
          </div>

          <button
            class="btn btn-outline-dark producto-carousel-card__btn btn-detalle-home"
            data-index="${index}"
            type="button">
            Ver detalle
          </button>
        </div>
      </article>
    `;
  }).join('');

  const botonesDetalle = contenedorProductos.querySelectorAll('.btn-detalle-home');

  botonesDetalle.forEach((boton, index) => {
    boton.addEventListener('click', () => {
      renderDetalleProducto(lista[index]);

      const modalElement = document.getElementById('productoDetalleModal');
      if (!modalElement) return;

      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    });
  });
}

function aplicarFiltros() {
  productosFiltrados = productos.filter(producto => {
    const categoriaTexto = obtenerCategoriaTexto(producto);

    const coincideCategoria =
      categoriaActiva === 'Todas' || categoriaTexto === categoriaActiva;

    const plataformas = Array.isArray(producto.sistema_operativo)
      ? producto.sistema_operativo
      : [producto.sistema_operativo];

    const coincidePlataforma =
      plataformaActiva === 'Todas' || plataformas.includes(plataformaActiva);

    const busqueda = textoBusqueda.toLowerCase();

    const coincideBusqueda =
      producto.nombre.toLowerCase().includes(busqueda) ||
      categoriaTexto.toLowerCase().includes(busqueda) ||
      producto.descripcion_breve.toLowerCase().includes(busqueda);

    return coincideCategoria && coincidePlataforma && coincideBusqueda;
  });

  renderProductos(productosFiltrados);
}

function renderFiltrosCategorias() {
  if (!filtrosCategorias) return;

  const categorias = [
    'Todas',
    ...new Set(productos.map(p => obtenerCategoriaTexto(p)))
  ].filter(Boolean);

  filtrosCategorias.innerHTML = categorias.map(categoria => `
    <div class="col-auto">
      <button
        class="btn ${categoriaActiva === categoria ? 'btn-light text-dark fw-bold' : 'btn-outline-light'} filtro-categoria-btn"
        data-categoria="${categoria}"
        type="button"
      >
        ${categoria}
      </button>
    </div>
  `).join('');

  filtrosCategorias.querySelectorAll('.filtro-categoria-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      categoriaActiva = btn.dataset.categoria;
      renderFiltrosCategorias();
      aplicarFiltros();
    });
  });
}

function renderFiltrosPlataformas() {
  if (!filtrosPlataformas) return;

  const plataformas = [
    'Todas',
    ...new Set(
      productos.flatMap(p =>
        Array.isArray(p.sistema_operativo)
          ? p.sistema_operativo
          : [p.sistema_operativo]
      )
    )
  ];

  filtrosPlataformas.innerHTML = plataformas.map(plataforma => `
    <div class="col-auto">
      <button
        class="btn ${plataformaActiva === plataforma ? 'btn-info text-dark fw-bold' : 'btn-outline-info'} filtro-plataforma-btn"
        data-plataforma="${plataforma}"
        type="button"
      >
        ${plataforma}
      </button>
    </div>
  `).join('');

  filtrosPlataformas.querySelectorAll('.filtro-plataforma-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      plataformaActiva = btn.dataset.plataforma;
      renderFiltrosPlataformas();
      aplicarFiltros();
    });
  });
}

function agregarEventoBusqueda() {
  if (!inputBusqueda) return;

  inputBusqueda.addEventListener('input', (e) => {
    textoBusqueda = e.target.value.trim();
    aplicarFiltros();
  });
}

function agregarEventosCarrusel() {
  if (btnLeft && contenedorProductos) {
    btnLeft.addEventListener('click', () => {
      contenedorProductos.scrollBy({ left: -360, behavior: 'smooth' });
    });
  }

  if (btnRight && contenedorProductos) {
    btnRight.addEventListener('click', () => {
      contenedorProductos.scrollBy({ left: 360, behavior: 'smooth' });
    });
  }
}

async function initInicioProductos() {
  try {
    const data = await Productos();
    productos = data.productos || [];
    productosFiltrados = [...productos];

    renderFiltrosCategorias();
    renderFiltrosPlataformas();
    agregarEventoBusqueda();
    agregarEventosCarrusel();
    renderProductos(productosFiltrados);
  } catch (error) {
    console.error('Error cargando productos en inicio:', error);

    if (contenedorProductos) {
      contenedorProductos.innerHTML = `
        <div class="alert alert-danger w-100 text-center">
          No se pudieron cargar los productos.
        </div>
      `;
    }
  }
}

document.addEventListener('DOMContentLoaded', initInicioProductos);