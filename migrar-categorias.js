// migrar-categorias.js
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { connectDB } from "./src/config/db.js";
import Producto from "./src/models/Producto.js";
import Categoria from "./src/models/Categoria.js";

// Mapeo manual de producto → categoría (basado en tus datos originales)
const categoriaMap = {
  "Microsoft Office 2021 Home & Student": "Ofimática",
  "Adobe Photoshop 2025": "Diseño Gráfico",
  "Adobe Illustrator 2025": "Diseño Gráfico",
  "Adobe Premiere Pro 2025": "Edición de Video",
  "AutoCAD 2026": "Diseño CAD",
  "Final Cut Pro": "Edición de Video",
  "Logic Pro": "Producción Musical",
  "Visual Studio Professional 2022": "Desarrollo",
  "JetBrains IntelliJ IDEA Ultimate": "Desarrollo",
  "JetBrains PyCharm Professional": "Desarrollo",
  "CorelDRAW Graphics Suite 2025": "Diseño Gráfico",
  "Affinity Designer V2": "Diseño Gráfico",
  "Affinity Photo V2": "Edición Fotográfica",
  "Affinity Publisher V2": "Maquetación",
  "Kaspersky Total Security 2025": "Seguridad",
  "Bitdefender Total Security 2025": "Seguridad",
  "NordVPN 2 años": "VPN",
  "ExpressVPN 1 año": "VPN",
  "MATLAB R2025a": "Científico / Ingeniería",
  "Adobe Acrobat Pro 2025": "PDF",
  "Microsoft Windows 11 Pro": "Sistema Operativo",
  "Parallels Desktop 20": "Virtualización",
  "VMware Fusion Pro": "Virtualización",
  "Tableau Desktop 2025": "Análisis de Datos",
  "QuickBooks Desktop Pro 2025": "Contabilidad",
  "ZBrush 2025": "Modelado 3D",
  "Cinema 4D 2025": "Modelado 3D / Animación",
  "Reaper 7 DAW": "Producción Musical",
  "Clip Studio Paint EX": "Ilustración Digital",
  "SketchUp Pro 2025": "Modelado 3D"
};

async function migrarCategorias() {
  try {
    await connectDB();
    console.log("✅ Conectado a MongoDB Atlas");

    const categorias = await Categoria.find();
    console.log(`📊 Se encontraron ${categorias.length} categorías`);

    const productos = await Producto.find();
    console.log(`📊 Se encontraron ${productos.length} productos`);

    let actualizados = 0;

    for (const producto of productos) {
      const nombreCategoria = categoriaMap[producto.nombre];

      if (!nombreCategoria) {
        console.log(`⚠️ No hay mapeo para: ${producto.nombre}`);
        continue;
      }

      const categoriaEncontrada = categorias.find(
        cat => cat.nombre === nombreCategoria
      );

      if (categoriaEncontrada) {
        await Producto.updateOne(
          { _id: producto._id },
          { categoria: categoriaEncontrada._id }
        );
        actualizados++;
        console.log(`✅ Actualizado: ${producto.nombre} → ${nombreCategoria}`);
      } else {
        console.log(`❌ Categoría no encontrada: ${nombreCategoria}`);
      }
    }

    console.log(`\n🎉 Migración finalizada. ${actualizados} productos actualizados.`);

  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.connection.close();
  }
}

migrarCategorias();