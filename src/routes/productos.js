import express from "express";
import Producto from "../models/Producto.js";

const router = express.Router();

//  GET ALL 
router.get("/", async (req, res) => {
  try {
    const productos = await Producto.find()
      .populate('categoria', 'nombre')   // Trae el nombre de la categoría
      .sort({ nombre: 1 });
    
    res.json(productos);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({ 
      message: "Error al obtener productos", 
      error: error.message 
    });
  }
});

//  GET ONE by Slug 
router.get("/:slug", async (req, res) => {
  try {
    const producto = await Producto.findOne({ slug: req.params.slug })
      .populate('categoria', 'nombre');

    if (!producto) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    res.json(producto);
  } catch (error) {
    res.status(500).json({ 
      message: "Error al obtener producto", 
      error: error.message 
    });
  }
});

//  CREATE (POST) 
router.post("/", async (req, res) => {
  try {
    const { nombre, categoria, ...resto } = req.body;

    if (!nombre || !categoria) {
      return res.status(400).json({ message: "Nombre y categoría son obligatorios" });
    }

    const nuevoProducto = new Producto({
      ...resto,
      nombre: nombre.trim(),
      categoria,
      slug: nombre.toLowerCase().trim().replace(/\s+/g, '-')
    });

    await nuevoProducto.save();
    res.status(201).json(nuevoProducto);
  } catch (error) {
    res.status(400).json({ 
      message: "Error al crear producto", 
      error: error.message 
    });
  }
});

//  UPDATE (PUT) 
router.put("/:id", async (req, res) => {
  try {
    const { nombre, ...resto } = req.body;

    const updateData = {
      ...resto,
      ...(nombre && { 
        nombre: nombre.trim(),
        slug: nombre.toLowerCase().trim().replace(/\s+/g, '-') 
      })
    };

    const productoActualizado = await Producto.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('categoria', 'nombre');

    if (!productoActualizado) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    res.json(productoActualizado);
  } catch (error) {
    res.status(400).json({ 
      message: "Error al actualizar producto", 
      error: error.message 
    });
  }
});

//  DELETE 
router.delete("/:id", async (req, res) => {
  try {
    const producto = await Producto.findByIdAndDelete(req.params.id);

    if (!producto) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    res.json({ 
      message: "Producto eliminado correctamente", 
      id: req.params.id 
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error al eliminar producto", 
      error: error.message 
    });
  }
});

export default router;