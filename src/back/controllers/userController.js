import bcrypt from 'bcrypt';
import { User } from '../models/User.js';

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 });
    
    res.json({
      ok: true,
      users: users
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al obtener usuarios",
      error: error.message
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        ok: false,
        message: "ID de usuario inválido"
      });
    }

    const user = await User.findById(id, { password: 0 });

    if (!user) {
      return res.status(404).json({
        ok: false,
        message: "Usuario no encontrado"
      });
    }

    res.json({
      ok: true,
      user: user
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al obtener usuario",
      error: error.message
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullname, email, password } = req.body;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        ok: false,
        message: "ID de usuario inválido"
      });
    }

    const updateData = {};
    if (fullname) updateData.fullname = fullname;
    if (email) updateData.email = email.toLowerCase();
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    const user = await User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }, { password: 0 });

    if (!user) {
      return res.status(404).json({
        ok: false,
        message: "Usuario no encontrado"
      });
    }

    res.json({
      ok: true,
      message: "Usuario actualizado correctamente",
      user: user
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al actualizar usuario",
      error: error.message
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        ok: false,
        message: "ID de usuario inválido"
      });
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({
        ok: false,
        message: "Usuario no encontrado"
      });
    }

    res.json({
      ok: true,
      message: "Usuario eliminado correctamente"
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al eliminar usuario",
      error: error.message
    });
  }
};