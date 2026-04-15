import mongoose from "mongoose";

const licenseSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "El producto es obligatorio"],
    },
    clave: {
      type: String,
      required: [true, "La clave de licencia es obligatoria"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    estado: {
      type: String,
      enum: ["disponible", "asignada", "activada"],
      default: "disponible",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },
    fechaAsignacion: {
      type: Date,
      default: null,
    },
    fechaExpiracion: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model("License", licenseSchema);