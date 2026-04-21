import fs from "fs";
import path from "path";
import axios from "axios";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ruta del JSON
const jsonPath = path.join(__dirname, "../../assets/productos.json");

// Carpeta destino
const outputDir = path.join(__dirname, "../../assets/productos");

// Crear carpeta si no existe
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Función para crear nombre limpio
function crearNombreArchivo(nombre, url) {
  const extension = path.extname(url).split("?")[0] || ".png";

  return nombre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "") + extension;
}

// Descargar imagen
async function descargarImagen(url, rutaDestino) {
  const response = await axios({
    url,
    method: "GET",
    responseType: "stream",
  });

  return new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(rutaDestino);
    response.data.pipe(writer);

    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

// MAIN
async function descargarTodas() {
  try {
    const rawData = fs.readFileSync(jsonPath, "utf-8");
    const data = JSON.parse(rawData);

    const productos = data.productos || [];

    for (const producto of productos) {
      const url = producto.thumbnail || producto.imagen;

      if (!url) {
        console.log(`⚠️ Sin imagen: ${producto.nombre}`);
        continue;
      }

      try {
        const nombreArchivo = crearNombreArchivo(producto.nombre, url);
        const rutaDestino = path.join(outputDir, nombreArchivo);

        console.log(`⬇️ Descargando: ${producto.nombre}`);

        await descargarImagen(url, rutaDestino);

        // OPCIONAL: actualizar rutas en JSON
        producto.thumbnail = `/assets/productos/${nombreArchivo}`;
        producto.imagen = `/assets/productos/${nombreArchivo}`;

      } catch (error) {
        console.log(`❌ Error descargando ${producto.nombre}`);
      }
    }

    // Guardar JSON actualizado
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));

    console.log("✅ Descarga completada y JSON actualizado");
    process.exit(0);

  } catch (error) {
    console.error("❌ Error general:", error.message);
    process.exit(1);
  }
}

descargarTodas();