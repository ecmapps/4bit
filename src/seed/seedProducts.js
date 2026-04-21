import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { connectDB } from "../config/db.js";
import Product from '../back/models/Product.js';
import Category from "../back/models/Category.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function crearSlug(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");
}

async function seedProducts() {
  try {
    await connectDB();

    const jsonPath = path.join(__dirname, "../../assets/productos.json");
    const rawData = fs.readFileSync(jsonPath, "utf-8");
    const data = JSON.parse(rawData);

    const productos = data.productos || [];

    for (const item of productos) {
      const categoriaSlug = crearSlug(item.categoria);

      let categoria = await Category.findOne({ slug: categoriaSlug });

      if (!categoria) {
        categoria = await Category.create({
          nombre: item.categoria,
          slug: categoriaSlug,
          descripcion: `Categoría ${item.categoria}`,
          activa: true
        });
      }

      const productoSlug = crearSlug(item.nombre);

      await Product.findOneAndUpdate(
        { slug: productoSlug },
        {
          nombre: item.nombre,
          slug: productoSlug,
          descripcion_breve: item.descripcion_breve,
          sistema_operativo: item.sistema_operativo || [],
          categoria: categoria._id,
          año_de_lanzamiento: item.año_de_lanzamiento,
          precio: item.precio,
          precio_en_descuento: item.precio_en_descuento ?? null,
          thumbnail: item.thumbnail || "",
          imagen: item.imagen || "",
          tipo_licencia: "perpetua",
          stock: 100,
          activo: true
        },
        {
          new: true,
          upsert: true,
          runValidators: true
        }
      );
    }

    console.log("Productos y categorías cargados correctamente en MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("Error cargando productos:", error.message);
    process.exit(1);
  }
}

seedProducts();