import express from "express";
import Usuario from "../models/Usuario.js";

const router = express.Router();

//  REGISTRO 
router.post("/registro", async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    // Verificar si el usuario ya existe
    const usuarioExiste = await Usuario.findOne({ email });
    if (usuarioExiste) {
      return res.status(400).json({ message: "El email ya está registrado" });
    }

    const nuevoUsuario = new Usuario({
      nombre,
      email,
      password
    });

    await nuevoUsuario.save();

    res.status(201).json({
      message: "Usuario registrado correctamente",
      usuario: {
        id: nuevoUsuario._id,
        nombre: nuevoUsuario.nombre,
        email: nuevoUsuario.email,
        rol: nuevoUsuario.rol
      }
    });
  } catch (error) {
    res.status(400).json({ 
      message: "Error al registrar usuario", 
      error: error.message 
    });
  }
});

//  LOGIN 
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(401).json({ message: "Credenciales incorrectas" });
    }

    const esValido = await usuario.compararPassword(password);
    if (!esValido) {
      return res.status(401).json({ message: "Credenciales incorrectas" });
    }

    res.json({
      message: "Inicio de sesión exitoso",
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error en el login", 
      error: error.message 
    });
  }
});

export default router;