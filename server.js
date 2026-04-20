import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcryptjs";

import { connectDB } from "./src/config/db.js";
import Product from "./src/models/Product.js";
import Category from "./src/models/Category.js";
import User from "./src/models/User.js";
import Cart from "./src/models/Cart.js";
import Order from "./src/models/Order.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API funcionando");
});

/* =========================
   TEST DB
========================= */
app.get("/test-db", async (req, res) => {
  try {
    const result = await mongoose.connection.db.admin().ping();

    res.status(200).json({
      ok: true,
      message: "Conexión con MongoDB correcta",
      dbName: mongoose.connection.name,
      result
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error probando la conexión con MongoDB",
      error: error.message
    });
  }
});

/* =========================
   TEST CATEGORY
========================= */
app.get("/test-insert-category", async (req, res) => {
  try {
    const category = await Category.findOneAndUpdate(
      { slug: "ofimatica" },
      {
        nombre: "Ofimática",
        slug: "ofimatica",
        descripcion: "Categoría de prueba",
        activa: true
      },
      {
        new: true,
        upsert: true,
        runValidators: true
      }
    );

    res.status(200).json({
      ok: true,
      message: "Categoría creada o encontrada correctamente",
      category
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error creando categoría",
      error: error.message
    });
  }
});

/* =========================
   TEST PRODUCT
========================= */
app.get("/test-insert-product", async (req, res) => {
  try {
    const category = await Category.findOne({ slug: "ofimatica" });

    if (!category) {
      return res.status(404).json({
        ok: false,
        message: "No existe la categoría 'ofimatica'. Primero ejecuta /test-insert-category"
      });
    }

    const product = await Product.findOneAndUpdate(
      { slug: "producto-prueba" },
      {
        nombre: "Producto prueba",
        slug: "producto-prueba",
        descripcion_breve: "Producto de prueba para crear la colección",
        sistema_operativo: ["Windows"],
        categoria: category._id,
        año_de_lanzamiento: 2025,
        precio: 1000,
        precio_en_descuento: 900,
        thumbnail: "test-thumb.png",
        imagen: "test-img.png",
        tipo_licencia: "perpetua",
        stock: 10,
        activo: true
      },
      {
        new: true,
        upsert: true,
        runValidators: true
      }
    );

    res.status(200).json({
      ok: true,
      message: "Producto creado o encontrado correctamente",
      product
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error creando producto",
      error: error.message
    });
  }
});

app.get("/collections", async (req, res) => {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();

    res.status(200).json({
      ok: true,
      dbName: mongoose.connection.name,
      collections
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error obteniendo colecciones",
      error: error.message
    });
  }
});

/* =========================
   AUTH - REGISTER
========================= */
app.post("/api/auth/register", async (req, res) => {
  try {
    const { fullname, email, password } = req.body;

    if (!fullname || !email || !password) {
      return res.status(400).json({
        ok: false,
        message: "Todos los campos son obligatorios"
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return res.status(409).json({
        ok: false,
        message: "El usuario ya existe"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullname,
      email: email.toLowerCase(),
      password: hashedPassword
    });

    res.status(201).json({
      ok: true,
      message: "Usuario registrado correctamente",
      user: {
        id: user._id,
        fullname: user.fullname,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error registrando usuario",
      error: error.message
    });
  }
});

/* =========================
   AUTH - LOGIN
========================= */
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        ok: false,
        message: "Email y contraseña son obligatorios"
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        ok: false,
        message: "Usuario no encontrado"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        ok: false,
        message: "Contraseña incorrecta"
      });
    }

    res.status(200).json({
      ok: true,
      message: "Inicio de sesión exitoso",
      user: {
        id: user._id,
        fullname: user.fullname,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error iniciando sesión",
      error: error.message
    });
  }
});

/* =========================
   PRODUCTS API
========================= */
app.get("/api/products", async (req, res) => {
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

app.get("/api/products/:id", async (req, res) => {
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

/* =========================
   CART API
========================= */

// Obtener carrito de un usuario
app.get("/api/cart/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    let cart = await Cart.findOne({ user: userId }).populate({
      path: "items.product",
      populate: {
        path: "categoria",
        select: "nombre slug"
      }
    });

    if (!cart) {
      cart = await Cart.create({
        user: userId,
        items: [],
        total: 0
      });
    }

    const formattedItems = cart.items.map((item) => ({
      _id: item.product?._id,
      nombre: item.product?.nombre || "",
      slug: item.product?.slug || "",
      descripcion_breve: item.product?.descripcion_breve || "",
      sistema_operativo: item.product?.sistema_operativo || [],
      categoria: item.product?.categoria?.nombre || "",
      precio: item.product?.precio || item.precioUnitario,
      precio_en_descuento: item.product?.precio_en_descuento ?? null,
      thumbnail: item.product?.thumbnail || "",
      imagen: item.product?.imagen || "",
      tipo_licencia: item.product?.tipo_licencia || "perpetua",
      stock: item.product?.stock || 0,
      cantidad: item.cantidad,
      precioUnitario: item.precioUnitario,
      subtotal: item.subtotal
    }));

    res.status(200).json({
      ok: true,
      cart: {
        user: cart.user,
        items: formattedItems,
        total: cart.total
      }
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error obteniendo carrito",
      error: error.message
    });
  }
});

// Agregar producto al carrito
app.post("/api/cart/:userId/add", async (req, res) => {
  try {
    const { userId } = req.params;
    const { productId, cantidad = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({
        ok: false,
        message: "productId es obligatorio"
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        ok: false,
        message: "Producto no encontrado"
      });
    }

    const precioUnitario = product.precio_en_descuento ?? product.precio;
    const cantidadFinal = Number(cantidad) || 1;

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = await Cart.create({
        user: userId,
        items: [],
        total: 0
      });
    }

    const itemExistente = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (itemExistente) {
      itemExistente.cantidad += cantidadFinal;
      itemExistente.precioUnitario = precioUnitario;
      itemExistente.subtotal = itemExistente.cantidad * precioUnitario;
    } else {
      cart.items.push({
        product: product._id,
        cantidad: cantidadFinal,
        precioUnitario,
        subtotal: cantidadFinal * precioUnitario
      });
    }

    cart.total = cart.items.reduce((acc, item) => acc + item.subtotal, 0);
    await cart.save();

    res.status(200).json({
      ok: true,
      message: "Producto agregado al carrito",
      cart
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error agregando producto al carrito",
      error: error.message
    });
  }
});

// Actualizar cantidad
app.put("/api/cart/:userId/item/:productId", async (req, res) => {
  try {
    const { userId, productId } = req.params;
    const { cantidad } = req.body;

    if (!cantidad || Number(cantidad) < 1) {
      return res.status(400).json({
        ok: false,
        message: "La cantidad debe ser mayor o igual a 1"
      });
    }

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({
        ok: false,
        message: "Carrito no encontrado"
      });
    }

    const item = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (!item) {
      return res.status(404).json({
        ok: false,
        message: "Producto no existe en el carrito"
      });
    }

    item.cantidad = Number(cantidad);
    item.subtotal = item.cantidad * item.precioUnitario;

    cart.total = cart.items.reduce((acc, item) => acc + item.subtotal, 0);
    await cart.save();

    res.status(200).json({
      ok: true,
      message: "Cantidad actualizada correctamente",
      cart
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error actualizando carrito",
      error: error.message
    });
  }
});

// Quitar producto del carrito
app.delete("/api/cart/:userId/item/:productId", async (req, res) => {
  try {
    const { userId, productId } = req.params;

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({
        ok: false,
        message: "Carrito no encontrado"
      });
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    cart.total = cart.items.reduce((acc, item) => acc + item.subtotal, 0);
    await cart.save();

    res.status(200).json({
      ok: true,
      message: "Producto eliminado del carrito",
      cart
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error eliminando producto del carrito",
      error: error.message
    });
  }
});

// Vaciar carrito
app.delete("/api/cart/:userId/clear", async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.params.userId });

    if (!cart) {
      cart = await Cart.create({
        user: req.params.userId,
        items: [],
        total: 0
      });
    } else {
      cart.items = [];
      cart.total = 0;
      await cart.save();
    }

    res.status(200).json({
      ok: true,
      message: "Carrito vaciado correctamente"
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error vaciando carrito",
      error: error.message
    });
  }
});

/* =========================
   ORDERS API
========================= */

// Crear pedido desde carrito
app.post("/api/orders/:userId/create-from-cart", async (req, res) => {
  try {
    const { userId } = req.params;
    const { metodoPago, referenciaPago = null } = req.body;

    if (!metodoPago) {
      return res.status(400).json({
        ok: false,
        message: "metodoPago es obligatorio"
      });
    }

    const cart = await Cart.findOne({ user: userId }).populate("items.product");

    if (!cart || !cart.items.length) {
      return res.status(400).json({
        ok: false,
        message: "El carrito está vacío"
      });
    }

    const itemsPedido = cart.items.map((item) => ({
      product: item.product._id,
      nombre: item.product.nombre,
      cantidad: item.cantidad,
      precioUnitario: item.precioUnitario,
      subtotal: item.subtotal,
      licencias: []
    }));

    const order = await Order.create({
      user: userId,
      items: itemsPedido,
      total: cart.total,
      metodoPago,
      referenciaPago,
      estado: "pagado"
    });

    cart.items = [];
    cart.total = 0;
    await cart.save();

    res.status(201).json({
      ok: true,
      message: "Pedido creado correctamente",
      order
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error creando pedido",
      error: error.message
    });
  }
});

// Obtener pedidos del usuario
app.get("/api/orders/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 });

    const formattedOrders = orders.map((order) => ({
      id: order._id,
      fecha: new Date(order.createdAt).toLocaleDateString("es-CR"),
      estado: order.estado,
      metodoPago: order.metodoPago,
      subtotal: order.total,
      total: order.total,
      items: order.items.map((item) => ({
        _id: item.product,
        nombre: item.nombre,
        cantidad: item.cantidad,
        precio: item.precioUnitario,
        precio_en_descuento: null,
        subtotal: item.subtotal,
        categoria: "",
        thumbnail: "/assets/Logo_4bit.webp",
        imagen: "/assets/Logo_4bit.webp"
      }))
    }));

    res.status(200).json({
      ok: true,
      orders: formattedOrders
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error obteniendo pedidos",
      error: error.message
    });
  }
});


const PORT = process.env.PORT || 3000;

if (!process.env.MONGODB_URI) {
  throw new Error("Falta la variable MONGODB_URI en el archivo .env");
}

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
};

startServer().catch((error) => {
  console.error("Error iniciando el servidor:", error.message);
});