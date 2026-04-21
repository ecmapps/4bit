import express from "express";
import Product from "../models/Product.js";

const router = express.Router();

/* =========================
   GET ALL PRODUCTS
========================= */
router.get("/", async (req, res) => {
  try {
    const products = await Product.find({ activo: true })
      .populate("categoria", "nombre slug")
      .sort({ nombre: 1 });

    const formattedProducts = products.map((product) => ({
      _id: product._id,
      nombre: product.nombre,
      slug: product.slug,
      descripcion_breve: product.descripcion_breve,
      sistema_operativo: product.sistema_operativo,
      categoria: product.categoria?.nombre || "",
      categoria_id: product.categoria?._id || null,
      categoria_slug: product.categoria?.slug || "",
      año_de_lanzamiento: product.año_de_lanzamiento,
      precio: product.precio,
      precio_en_descuento: product.precio_en_descuento,
      thumbnail: product.thumbnail,
      imagen: product.imagen,
      tipo_licencia: product.tipo_licencia,
      stock: product.stock,
      activo: product.activo
    }));

    res.status(200).json({
      ok: true,
      products: formattedProducts
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error obteniendo productos",
      error: error.message
    });
  }
});

/* =========================
   GET PRODUCT BY ID
========================= */
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("categoria", "nombre slug");

    if (!product) {
      return res.status(404).json({
        ok: false,
        message: "Producto no encontrado"
      });
    }

    res.status(200).json({
      ok: true,
      product: {
        _id: product._id,
        nombre: product.nombre,
        slug: product.slug,
        descripcion_breve: product.descripcion_breve,
        sistema_operativo: product.sistema_operativo,
        categoria: product.categoria?.nombre || "",
        categoria_id: product.categoria?._id || null,
        categoria_slug: product.categoria?.slug || "",
        año_de_lanzamiento: product.año_de_lanzamiento,
        precio: product.precio,
        precio_en_descuento: product.precio_en_descuento,
        thumbnail: product.thumbnail,
        imagen: product.imagen,
        tipo_licencia: product.tipo_licencia,
        stock: product.stock,
        activo: product.activo
      }
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error obteniendo producto",
      error: error.message
    });
  }
});

export default router;