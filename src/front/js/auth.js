export class AuthManager {
  constructor() {
    this.storageKey = '4bit_user';
  }

  // Guardar usuario al registrarse
  register(fullname, email, password) {
    const user = {
      id: Date.now(),
      fullname,
      email,
      password, // En producción, NUNCA guardes contraseñas en cliente
      createdAt: new Date().toISOString(),
      isActive: true
    };

    localStorage.setItem(this.storageKey, JSON.stringify(user));
    return user;
  }

  // Login con validación
  login(email, password) {
    const storedUser = localStorage.getItem(this.storageKey);
    
    if (!storedUser) {
      throw new Error('Usuario no encontrado');
    }

    const user = JSON.parse(storedUser);

    if (user.email !== email || user.password !== password) {
      throw new Error('Email o contraseña incorrectos');
    }

    // Actualizar estado activo
    user.isActive = true;
    user.lastLogin = new Date().toISOString();
    localStorage.setItem(this.storageKey, JSON.stringify(user));

    return user;
  }

  // Obtener usuario activo
  getActiveUser() {
    const storedUser = localStorage.getItem(this.storageKey);
    if (!storedUser) return null;
  
    const user = JSON.parse(storedUser);
    return user.isActive ? user : null;
  }

  // Verificar si hay usuario activo
  isUserActive() {
    const user = this.getActiveUser();
    return !!user && user.isActive === true;
  }

  

  // Logout
  logout() {
    const user = this.getActiveUser();
    if (user) {
      user.isActive = false;
      localStorage.setItem(this.storageKey, JSON.stringify(user));
    }
    localStorage.removeItem(this.storageKey);
  }

  // Obtener nombre del usuario activo
  getUsername() {
    const user = this.getActiveUser();
    return user ? user.fullname : 'Visitante';
  }
}

export const auth = new AuthManager();