// src/routes/categorias.js
import express from "express";
import Categoria from "../models/Categoria.js";

const router = express.Router();

//  GET ALL - Todas las categorías 
router.get("/", async (req, res) => {
  try {
    const categorias = await Categoria.find().sort({ nombre: 1 });
    res.json(categorias);
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    res.status(500).json({ 
      message: "Error al obtener categorías", 
      error: error.message 
    });
  }
});

//  GET ONE - Por ID 
router.get("/:id", async (req, res) => {
  try {
    const categoria = await Categoria.findById(req.params.id);
    
    if (!categoria) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }
    
    res.json(categoria);
  } catch (error) {
    res.status(500).json({ 
      message: "Error al obtener categoría", 
      error: error.message 
    });
  }
});

//  CREATE (POST) 
router.post("/", async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;

    if (!nombre) {
      return res.status(400).json({ message: "El nombre de la categoría es obligatorio" });
    }

    const nuevaCategoria = new Categoria({
      nombre: nombre.trim(),
      descripcion: descripcion ? descripcion.trim() : "",
      slug: nombre.toLowerCase().trim().replace(/\s+/g, '-')
    });

    await nuevaCategoria.save();
    
    res.status(201).json({
      message: "Categoría creada correctamente",
      categoria: nuevaCategoria
    });
  } catch (error) {
    res.status(400).json({ 
      message: "Error al crear categoría", 
      error: error.message 
    });
  }
});

//  UPDATE (PUT) 
router.put("/:id", async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;

    const updateData = {
      ...(nombre && { 
        nombre: nombre.trim(),
        slug: nombre.toLowerCase().trim().replace(/\s+/g, '-') 
      }),
      ...(descripcion !== undefined && { descripcion: descripcion.trim() })
    };

    const categoriaActualizada = await Categoria.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!categoriaActualizada) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }

    res.json({
      message: "Categoría actualizada correctamente",
      categoria: categoriaActualizada
    });
  } catch (error) {
    res.status(400).json({ 
      message: "Error al actualizar categoría", 
      error: error.message 
    });
  }
});

//  DELETE 
router.delete("/:id", async (req, res) => {
  try {
    const categoria = await Categoria.findByIdAndDelete(req.params.id);

    if (!categoria) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }

    res.json({ 
      message: "Categoría eliminada correctamente",
      id: req.params.id 
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error al eliminar categoría", 
      error: error.message 
    });
  }
});

export default router;