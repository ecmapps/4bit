// ver-productos.js
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { connectDB } from "./src/config/db.js";
import Producto from "./src/models/Producto.js";

async function verProductos() {
  try {
    await connectDB();
    console.log("✅ Conectado");

    const productos = await Producto.find().limit(5); // solo los primeros 5 para no saturar

    console.log("\n🔍 Estructura de los productos (campo categoria):");
    
    productos.forEach((p, i) => {
      console.log(`\nProducto ${i+1}: ${p.nombre}`);
      console.log(`   → categoria:`, p.categoria);
      console.log(`   → tipo:`, typeof p.categoria);
    });

  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await mongoose.connection.close();
  }
}

verProductos();