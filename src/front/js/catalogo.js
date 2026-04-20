import { Productos } from './productos.js';
import { agregarProductoAlCarrito } from './carrito.js';

const catalogoDiv = document.getElementById('catalogo');
const categoriasDiv = document.getElementById('categorias');
const plataformasDiv = document.getElementById('plataformas');
const precioRange = document.getElementById('precio-range');
const precioValue = document.getElementById('precio-value');
const btnAplicarFiltros = document.getElementById('btn-aplicar-filtros');
const btnLimpiarFiltros = document.getElementById('btn-limpiar-filtros');
const ordenarProductos = document.getElementById('ordenar-productos');
const catalogoResumen = document.getElementById('catalogo-resumen');

let productos = [];
let productosFiltrados = [];

function formatearCRC(valor) {
  return `₡${Number(valor).toLocaleString('es-CR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

function obtenerPrecioFinal(producto) {
  return producto.precio_en_descuento ?? producto.precio;
}

function normalizarId(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '');
}

function actualizarTextoPrecio() {
  if (!precioRange || !precioValue) return;
  precioValue.textContent = `Hasta: ${formatearCRC(precioRange.value)}`;
}

function obtenerCategoriasUnicas(lista) {
  return [...new Set(lista.map(producto => producto.categoria))]
    .sort((a, b) => a.localeCompare(b));
}

function obtenerPlataformasUnicas(lista) {
  return [...new Set(
    lista.flatMap(producto =>
      Array.isArray(producto.sistema_operativo)
        ? producto.sistema_operativo
        : [producto.sistema_operativo]
    )
  )].sort((a, b) => a.localeCompare(b));
}

function renderizarCategorias(lista) {
  if (!categoriasDiv) return;

  const categorias = obtenerCategoriasUnicas(lista);

  categoriasDiv.innerHTML = categorias.map(categoria => {
    const id = `cat-${normalizarId(categoria)}`;
    return `
      <div class="form-check">
        <input class="form-check-input filtro-categoria" type="checkbox" value="${categoria}" id="${id}">
        <label class="form-check-label" for="${id}">${categoria}</label>
      </div>
    `;
  }).join('');
}

function renderizarPlataformas(lista) {
  if (!plataformasDiv) return;

  const plataformas = obtenerPlataformasUnicas(lista);

  plataformasDiv.innerHTML = plataformas.map(plataforma => {
    const id = `plat-${normalizarId(plataforma)}`;
    return `
      <input type="checkbox" class="btn-check filtro-plataforma" id="${id}" value="${plataforma}" autocomplete="off">
      <label class="btn btn-outline-light btn-sm" for="${id}">${plataforma}</label>
    `;
  }).join('');
}

function obtenerFiltrosSeleccionados() {
  const categoriasSeleccionadas = [...document.querySelectorAll('.filtro-categoria:checked')]
    .map(input => input.value);

  const plataformasSeleccionadas = [...document.querySelectorAll('.filtro-plataforma:checked')]
    .map(input => input.value);

  const precioMaximo = Number(precioRange?.value ?? 500000);

  return {
    categoriasSeleccionadas,
    plataformasSeleccionadas,
    precioMaximo
  };
}

function ordenarListado() {
  const criterio = ordenarProductos?.value ?? 'default';

  productosFiltrados.sort((a, b) => {
    const precioA = obtenerPrecioFinal(a);
    const precioB = obtenerPrecioFinal(b);

    switch (criterio) {
      case 'precio-asc':
        return precioA - precioB;
      case 'precio-desc':
        return precioB - precioA;
      case 'nombre-asc':
        return a.nombre.localeCompare(b.nombre);
      case 'nombre-desc':
        return b.nombre.localeCompare(a.nombre);
      default:
        return 0;
    }
  });
}

function agregarAlCarrito(producto) {
  agregarProductoAlCarrito(producto, 1);
}

function irADetalle(productId) {
  window.location.href = `/src/front/pages/producto.html?id=${productId}`;
}

function renderizarCatalogo(lista) {
  if (!catalogoDiv) return;

  if (catalogoResumen) {
    catalogoResumen.textContent = `${lista.length} producto(s) encontrados`;
  }

  if (!lista.length) {
    catalogoDiv.innerHTML = `
      <div class="alert alert-light text-center w-100">
        No se encontraron productos con esos filtros.
      </div>
    `;
    return;
  }

  catalogoDiv.innerHTML = lista.map((producto) => {
    const precioFinal = obtenerPrecioFinal(producto);
    const tieneDescuento = producto.precio_en_descuento !== null && producto.precio_en_descuento !== undefined;
    const productId = producto._id;

    return `
      <div class="catalogo-item">
        <div class="card h-100 shadow p-2">
          <img
            src="${producto.thumbnail || producto.imagen || '/assets/Logo_4bit.webp'}"
            class="card-img-top rounded align-self-center"
            alt="${producto.nombre}"
            loading="lazy"
            onerror="this.onerror=null; this.src='/assets/Logo_4bit.webp';"
          >

          <div class="card-body justify-content-start d-flex flex-column">
            <div class="card-title fs-5 fw-bold">${producto.nombre}</div>

            <p class="card-text mb-2">
              <span class="badge text-bg-dark">${producto.categoria}</span>
            </p>

            <p class="card-text small text-muted">
              ${producto.descripcion_breve}
            </p>

            <p class="card-text mb-2">
              <strong>Plataforma:</strong>
              ${Array.isArray(producto.sistema_operativo)
                ? producto.sistema_operativo.join(', ')
                : producto.sistema_operativo}
            </p>

            <p class="card-text mb-3">
              ${
                tieneDescuento
                  ? `
                    <span class="text-decoration-line-through text-muted me-2">${formatearCRC(producto.precio)}</span>
                    <span class="fw-bold text-success">${formatearCRC(precioFinal)}</span>
                  `
                  : `
                    <span class="fw-bold">${formatearCRC(precioFinal)}</span>
                  `
              }
            </p>

            <div class="mt-auto d-grid gap-2">
              <button 
                class="btn btn-outline-primary btn-ver-detalle" 
                type="button" 
                data-id="${productId}">
                Ver detalle
              </button>

              <button 
                class="btn btn-warning btn-agregar-carrito" 
                type="button" 
                data-id="${productId}">
                Agregar al carrito
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  const botonesAgregar = catalogoDiv.querySelectorAll('.btn-agregar-carrito');
  const botonesDetalle = catalogoDiv.querySelectorAll('.btn-ver-detalle');

  botonesAgregar.forEach((boton) => {
    boton.addEventListener('click', () => {
      const id = boton.dataset.id;
      const producto = productos.find(p => p._id === id);
      if (producto) agregarAlCarrito(producto);
    });
  });

  botonesDetalle.forEach((boton) => {
    boton.addEventListener('click', () => {
      const id = boton.dataset.id;
      irADetalle(id);
    });
  });
}

function aplicarFiltros() {
  const { categoriasSeleccionadas, plataformasSeleccionadas, precioMaximo } = obtenerFiltrosSeleccionados();

  productosFiltrados = productos.filter(producto => {
    const precio = obtenerPrecioFinal(producto);

    const plataformasProducto = Array.isArray(producto.sistema_operativo)
      ? producto.sistema_operativo
      : [producto.sistema_operativo];

    const coincideCategoria =
      categoriasSeleccionadas.length === 0 ||
      categoriasSeleccionadas.includes(producto.categoria);

    const coincidePlataforma =
      plataformasSeleccionadas.length === 0 ||
      plataformasSeleccionadas.some(plataforma => plataformasProducto.includes(plataforma));

    const coincidePrecio = precio <= precioMaximo;

    return coincideCategoria && coincidePlataforma && coincidePrecio;
  });

  ordenarListado();
  renderizarCatalogo(productosFiltrados);
}

function limpiarFiltros() {
  document.querySelectorAll('.filtro-categoria').forEach(input => {
    input.checked = false;
  });

  document.querySelectorAll('.filtro-plataforma').forEach(input => {
    input.checked = false;
  });

  if (precioRange) {
    precioRange.value = 500000;
  }

  if (ordenarProductos) {
    ordenarProductos.value = 'default';
  }

  actualizarTextoPrecio();

  productosFiltrados = [...productos];
  renderizarCatalogo(productosFiltrados);
}

async function initCatalogo() {
  try {
    const data = await Productos();
    productos = data.productos || [];
    productosFiltrados = [...productos];

    renderizarCategorias(productos);
    renderizarPlataformas(productos);
    actualizarTextoPrecio();
    renderizarCatalogo(productosFiltrados);

    btnAplicarFiltros?.addEventListener('click', aplicarFiltros);
    btnLimpiarFiltros?.addEventListener('click', limpiarFiltros);

    precioRange?.addEventListener('input', actualizarTextoPrecio);

    ordenarProductos?.addEventListener('change', () => {
      ordenarListado();
      renderizarCatalogo(productosFiltrados);
    });

  } catch (error) {
    console.error('Error cargando catálogo:', error);

    if (catalogoDiv) {
      catalogoDiv.innerHTML = `
        <div class="alert alert-danger text-center w-100">
          No se pudo cargar el catálogo.
        </div>
      `;
    }
  }
}

document.addEventListener('DOMContentLoaded', initCatalogo);