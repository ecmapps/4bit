import Product from '../models/Product.js';
import Category from '../models/Category.js';

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate('categoria');
    
    res.json({
      ok: true,
      products: products
    });
  } catch (error) {
    console.error('Error en getAllProducts:', error.message);
    res.status(500).json({
      ok: false,
      message: "Error al obtener productos",
      error: error.message
    });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        ok: false,
        message: "ID de producto inválido"
      });
    }

    const product = await Product.findById(id).populate('categoria');

    if (!product) {
      return res.status(404).json({
        ok: false,
        message: "Producto no encontrado"
      });
    }

    res.json({
      ok: true,
      product: product
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al obtener producto",
      error: error.message
    });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { nombre, slug, descripcion_breve, precio, categoria, sistema_operativo, año_de_lanzamiento, precio_en_descuento, thumbnail, imagen, tipo_licencia, duracion_meses, stock } = req.body;

    if (!nombre || !slug || !descripcion_breve || !precio || !categoria) {
      return res.status(400).json({
        ok: false,
        message: "Nombre, slug, descripción, precio y categoría son obligatorios"
      });
    }

    const categoryExists = await Category.findById(categoria);
    if (!categoryExists) {
      return res.status(404).json({
        ok: false,
        message: "Categoría no encontrada"
      });
    }

    const newProduct = new Product({
      nombre,
      slug,
      descripcion_breve,
      precio,
      categoria,
      sistema_operativo: sistema_operativo || [],
      año_de_lanzamiento,
      precio_en_descuento,
      thumbnail,
      imagen,
      tipo_licencia,
      duracion_meses,
      stock: stock || 0,
      activo: true
    });

    const savedProduct = await newProduct.save();
    await savedProduct.populate('categoria');

    res.status(201).json({
      ok: true,
      message: "Producto creado correctamente",
      product: savedProduct
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al crear producto",
      error: error.message
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, slug, descripcion_breve, precio, categoria, sistema_operativo, año_de_lanzamiento, precio_en_descuento, thumbnail, imagen, tipo_licencia, duracion_meses, stock, activo } = req.body;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        ok: false,
        message: "ID de producto inválido"
      });
    }

    const updateData = {};
    if (nombre) updateData.nombre = nombre;
    if (slug) updateData.slug = slug;
    if (descripcion_breve) updateData.descripcion_breve = descripcion_breve;
    if (precio) updateData.precio = precio;
    if (categoria) {
      const categoryExists = await Category.findById(categoria);
      if (!categoryExists) {
        return res.status(404).json({
          ok: false,
          message: "Categoría no encontrada"
        });
      }
      updateData.categoria = categoria;
    }
    if (sistema_operativo) updateData.sistema_operativo = sistema_operativo;
    if (año_de_lanzamiento) updateData.año_de_lanzamiento = año_de_lanzamiento;
    if (precio_en_descuento) updateData.precio_en_descuento = precio_en_descuento;
    if (thumbnail) updateData.thumbnail = thumbnail;
    if (imagen) updateData.imagen = imagen;
    if (tipo_licencia) updateData.tipo_licencia = tipo_licencia;
    if (duracion_meses) updateData.duracion_meses = duracion_meses;
    if (stock !== undefined) updateData.stock = stock;
    if (activo !== undefined) updateData.activo = activo;

    const product = await Product.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).populate('categoria');

    if (!product) {
      return res.status(404).json({
        ok: false,
        message: "Producto no encontrado"
      });
    }

    res.json({
      ok: true,
      message: "Producto actualizado correctamente",
      product: product
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al actualizar producto",
      error: error.message
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        ok: false,
        message: "ID de producto inválido"
      });
    }

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({
        ok: false,
        message: "Producto no encontrado"
      });
    }

    res.json({
      ok: true,
      message: "Producto eliminado correctamente"
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al eliminar producto",
      error: error.message
    });
  }
};