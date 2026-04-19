
import mongoose from "mongoose";

const productoSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  nombre: {
    type: String,
    required: true
  },
  sistema_operativo: [{
    type: String
  }],
  categoria: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Categoria",          
    required: true
  },
  año_de_lanzamiento: Number,
  descripcion_breve: String,
  precio: {
    type: Number,
    required: true
  },
  precio_en_descuento: Number,
  thumbnail: String,
  imagen: String
}, {
  timestamps: true,
  collection: "products"
});

export default mongoose.model("Producto", productoSchema);