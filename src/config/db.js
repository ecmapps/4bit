import mongoose from "mongoose";

export async function connectDB() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("La variable MONGODB_URI no está definida en el archivo .env");
    }

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB conectado correctamente");
  } catch (error) {
    console.error("Error conectando a MongoDB:", error.message);
    process.exit(1);
  }
}