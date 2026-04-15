import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import { connectDB } from "./src/config/db.js";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("API funcionando");
});

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
    console.log(`Servidor corriendo en puerto ${PORT}`);
  });
};

startServer();