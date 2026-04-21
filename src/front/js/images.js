const IMAGEN_DEFAULT = "/assets/Logo_4bit.webp";

export function obtenerImagenProducto(producto) {
  return producto?.thumbnail || producto?.imagen || IMAGEN_DEFAULT;
}

export function getImageFallbackAttr() {
  return `this.onerror=null; this.src='${IMAGEN_DEFAULT}';`;
}