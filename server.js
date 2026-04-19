import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { connectDB } from "./src/config/db.js";
import productosRoutes from "./src/routes/productos.js";
import categoriasRoutes from "./src/routes/categorias.js";
import usuariosRoutes from "./src/routes/usuarios.js";

const app = express();

// cors
app.use(cors({
  origin: ['http://localhost:5500', 'http://127.0.0.1:5500'], // permite Live Server
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Rutas
app.use("/api/productos", productosRoutes);

app.use("/api/categorias", categoriasRoutes);

app.use("/api/usuarios", usuariosRoutes);

app.get("/", (req, res) => {
  res.send("API 4bit funcionando");
});

//Ruta de prueba de conexión
app.get("/test-db", async (req, res) => {
  try {
    const result = await mongoose.connection.db.admin().ping();
    res.status(200).json({
      ok: true,
      message: "Conexión con MongoDB correcta",
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

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto http://localhost:${PORT}`);
    console.log(`Prueba los productos en: http://localhost:${PORT}/api/productos`);
  });
};

startServer();