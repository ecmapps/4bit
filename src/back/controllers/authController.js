import bcrypt from 'bcrypt';
import { User } from '../models/User.js';

export const register = async (req, res) => {
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
      return res.status(400).json({
        ok: false,
        message: "El email ya está registrado"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      fullname,
      email: email.toLowerCase(),
      password: hashedPassword
    });

    const savedUser = await newUser.save();

    res.status(201).json({
      ok: true,
      message: "Usuario registrado correctamente",
      user: {
        id: savedUser._id,
        fullname: savedUser.fullname,
        email: savedUser.email
      }
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al registrar usuario",
      error: error.message
    });
  }
};

export const login = async (req, res) => {
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

    res.json({
      ok: true,
      message: "Login exitoso",
      user: {
        id: user._id,
        fullname: user.fullname,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al iniciar sesión",
      error: error.message
    });
  }
};