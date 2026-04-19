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

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API funcionando - VERSION NUEVA 1435");
});

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
   AUTH - REGISTRO
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