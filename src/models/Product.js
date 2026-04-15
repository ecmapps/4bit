import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      trim: true,
      minlength: 2,
      maxlength: 150,
    },
    slug: {
      type: String,
      required: [true, "El slug es obligatorio"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    descripcion_breve: {
      type: String,
      required: [true, "La descripción es obligatoria"],
      trim: true,
      maxlength: 500,
    },
    sistema_operativo: {
      type: [String],
      default: [],
    },
    categoria: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "La categoría es obligatoria"],
    },
    año_de_lanzamiento: {
      type: Number,
      min: 1900,
      max: 2100,
    },
    precio: {
      type: Number,
      required: [true, "El precio es obligatorio"],
      min: 0,
    },
    precio_en_descuento: {
      type: Number,
      default: null,
      min: 0,
    },
    thumbnail: {
      type: String,
      default: "",
      trim: true,
    },
    imagen: {
      type: String,
      default: "",
      trim: true,
    },
    tipo_licencia: {
      type: String,
      enum: ["perpetua", "suscripcion", "anual", "mensual", "trial"],
      default: "perpetua",
    },
    duracion_meses: {
      type: Number,
      default: null,
      min: 1,
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    activo: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model("Product", productSchema);