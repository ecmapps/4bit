import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate('category');
    
    res.json({
      ok: true,
      products: products
    });
  } catch (error) {
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

    const product = await Product.findById(id).populate('category');

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
    const { name, description, price, stock, category } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({
        ok: false,
        message: "Nombre, precio y categoría son obligatorios"
      });
    }

    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(404).json({
        ok: false,
        message: "Categoría no encontrada"
      });
    }

    const newProduct = new Product({
      name,
      description,
      price,
      stock: stock || 0,
      category
    });

    const savedProduct = await newProduct.save();
    await savedProduct.populate('category');

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
    const { name, description, price, stock, category } = req.body;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        ok: false,
        message: "ID de producto inválido"
      });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (price) updateData.price = price;
    if (stock !== undefined) updateData.stock = stock;
    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(404).json({
          ok: false,
          message: "Categoría no encontrada"
        });
      }
      updateData.category = category;
    }

    const product = await Product.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).populate('category');

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