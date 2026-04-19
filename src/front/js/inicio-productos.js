const API_URL = 'http://localhost:3000/api/productos';

console.log("🚀 inicio-productos.js cargado correctamente");

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
  return `₡${Number(valor).toLocaleString('es-CR')}`;
}

function obtenerPrecioFinal(producto) {
  return producto.precio_en_descuento ?? producto.precio;
}

function getCategoriaNombre(producto) {
  if (!producto.categoria) return 'Sin categoría';
  
  if (typeof producto.categoria === 'object' && producto.categoria.nombre) {
    return producto.categoria.nombre;
  }

  return producto.categoria;
}

function agregarAlCarrito(producto) {
  const carritoGuardado = JSON.parse(localStorage.getItem('4bit_cart')) || [];
  const existente = carritoGuardado.find(item => item.slug === producto.slug);

  if (existente) {
    existente.cantidad += 1;
  } else {
    carritoGuardado.push({ ...producto, cantidad: 1 });
  }

  localStorage.setItem('4bit_cart', JSON.stringify(carritoGuardado));
  alert(`"${producto.nombre}" fue agregado al carrito.`);
}

function renderDetalleProducto(producto) {
  const modalBody = document.getElementById('productoDetalleBody');
  if (!modalBody) return;

  const precioFinal = obtenerPrecioFinal(producto);
  const tieneDescuento = producto.precio_en_descuento != null;
  const categoriaNombre = getCategoriaNombre(producto);

  modalBody.innerHTML = `
    <div class="row g-4 align-items-center">
      <div class="col-md-5 text-center">
        <img src="${producto.thumbnail || producto.imagen || '/assets/Logo_4bit.webp'}" 
             alt="${producto.nombre}" class="img-fluid" 
             style="max-height: 260px; object-fit: contain;"
             onerror="this.onerror=null; this.src='/assets/Logo_4bit.webp';">
      </div>
      <div class="col-md-7">
        <h3 class="fw-bold mb-3">${producto.nombre}</h3>
        <p class="mb-2"><span class="badge text-bg-dark">${categoriaNombre}</span></p>
        <p class="text-muted mb-3">${producto.descripcion_breve}</p>
        <p><strong>Plataformas:</strong> ${Array.isArray(producto.sistema_operativo) ? producto.sistema_operativo.join(', ') : producto.sistema_operativo}</p>
        <p><strong>Año de lanzamiento:</strong> ${producto.año_de_lanzamiento}</p>
        
        <div class="mb-4">
          ${tieneDescuento ? `<span class="text-decoration-line-through text-muted me-2">${formatearCRC(producto.precio)}</span>` : ''}
          <span class="fw-bold fs-4 text-success">${formatearCRC(precioFinal)}</span>
        </div>

        <button class="btn btn-warning" id="btn-agregar-detalle">Agregar al carrito</button>
      </div>
    </div>
  `;

  document.getElementById('btn-agregar-detalle').addEventListener('click', () => agregarAlCarrito(producto));
}

function renderProductos(lista) {
  if (!contenedorProductos) return;

  if (resumenProductos) {
    resumenProductos.textContent = `${lista.length} producto(s) encontrados`;
  }

  if (!lista.length) {
    contenedorProductos.innerHTML = `<div class="alert alert-light w-100 text-center">No se encontraron productos con esos filtros.</div>`;
    return;
  }

  contenedorProductos.innerHTML = lista.map(producto => {
    const precioFinal = obtenerPrecioFinal(producto);
    const tieneDescuento = producto.precio_en_descuento != null;
    const categoriaNombre = getCategoriaNombre(producto);

    return `
      <article class="producto-carousel-card">
        <div class="producto-carousel-card__top">
          <img src="${producto.thumbnail || producto.imagen}" 
               class="producto-carousel-card__img" 
               alt="${producto.nombre}"
               loading="lazy"
               onerror="this.onerror=null; this.src='/assets/Logo_4bit.webp';">
          <div class="producto-carousel-card__body">
            <h5 class="producto-carousel-card__title">${producto.nombre}</h5>
            <p class="producto-carousel-card__desc">${producto.descripcion_breve}</p>
            <p class="mb-2"><span class="badge text-bg-dark">${categoriaNombre}</span></p>
            <p class="producto-carousel-card__platforms">
              <strong>Plataformas:</strong> ${Array.isArray(producto.sistema_operativo) ? producto.sistema_operativo.join(', ') : producto.sistema_operativo}
            </p>
          </div>
        </div>
        <div class="producto-carousel-card__bottom">
          <div class="producto-carousel-card__price">
            ${tieneDescuento ? `<span class="producto-carousel-card__old-price">${formatearCRC(producto.precio)}</span>` : ''}
            <span class="producto-carousel-card__new-price">${formatearCRC(precioFinal)}</span>
          </div>
          <button class="btn btn-outline-dark producto-carousel-card__btn btn-detalle-home" data-slug="${producto.slug}">
            Ver detalle
          </button>
        </div>
      </article>
    `;
  }).join('');

  document.querySelectorAll('.btn-detalle-home').forEach(btn => {
    btn.addEventListener('click', () => {
      const producto = lista.find(p => p.slug === btn.dataset.slug);
      if (producto) renderDetalleProducto(producto);

      const modal = new bootstrap.Modal(document.getElementById('productoDetalleModal'));
      modal.show();
    });
  });
}

function aplicarFiltros() {
  productosFiltrados = productos.filter(producto => {
    const categoriaNombre = getCategoriaNombre(producto);
    const coincideCategoria = categoriaActiva === 'Todas' || categoriaNombre === categoriaActiva;

    const plataformas = Array.isArray(producto.sistema_operativo) ? producto.sistema_operativo : [producto.sistema_operativo];
    const coincidePlataforma = plataformaActiva === 'Todas' || plataformas.includes(plataformaActiva);

    const coincideBusqueda = textoBusqueda === '' ||
      producto.nombre.toLowerCase().includes(textoBusqueda) ||
      categoriaNombre.toLowerCase().includes(textoBusqueda) ||
      producto.descripcion_breve.toLowerCase().includes(textoBusqueda);

    return coincideCategoria && coincidePlataforma && coincideBusqueda;
  });

  renderProductos(productosFiltrados);
}

function renderFiltrosCategorias() {
  if (!filtrosCategorias) return;

  const categorias = ['Todas', ...new Set(productos.map(p => getCategoriaNombre(p)))];

  filtrosCategorias.innerHTML = categorias.map(categoria => `
    <div class="col-auto">
      <button class="btn ${categoriaActiva === categoria ? 'btn-light text-dark fw-bold' : 'btn-outline-light'} filtro-categoria-btn" data-categoria="${categoria}">
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

  const plataformas = ['Todas', ...new Set(productos.flatMap(p => 
    Array.isArray(p.sistema_operativo) ? p.sistema_operativo : [p.sistema_operativo]
  ))];

  filtrosPlataformas.innerHTML = plataformas.map(plataforma => `
    <div class="col-auto">
      <button class="btn ${plataformaActiva === plataforma ? 'btn-info text-dark fw-bold' : 'btn-outline-info'} filtro-plataforma-btn" data-plataforma="${plataforma}">
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
    textoBusqueda = e.target.value.trim().toLowerCase();
    aplicarFiltros();
  });
}

function agregarEventosCarrusel() {
  if (btnLeft && contenedorProductos) btnLeft.addEventListener('click', () => contenedorProductos.scrollBy({ left: -360, behavior: 'smooth' }));
  if (btnRight && contenedorProductos) btnRight.addEventListener('click', () => contenedorProductos.scrollBy({ left: 360, behavior: 'smooth' }));
}

async function initInicioProductos() {
  try {
    console.log("🔄 Cargando productos desde API...");
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    productos = await response.json();
    console.log(`✅ ${productos.length} productos cargados desde MongoDB Atlas`);

    productosFiltrados = [...productos];

    renderFiltrosCategorias();
    renderFiltrosPlataformas();
    agregarEventoBusqueda();
    agregarEventosCarrusel();
    renderProductos(productosFiltrados);

  } catch (error) {
    console.error('❌ Error cargando productos:', error);
    if (contenedorProductos) {
      contenedorProductos.innerHTML = `<div class="alert alert-danger text-center">No se pudieron cargar los productos desde el servidor.</div>`;
    }
  }
}

document.addEventListener('DOMContentLoaded', initInicioProductos);