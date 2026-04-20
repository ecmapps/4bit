export function getActiveUser() {
    try {
      const raw = localStorage.getItem("4bit_active_user");
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.error("Error leyendo usuario activo:", error);
      return null;
    }
  }
  
  export function getActiveUserId() {
    const user = getActiveUser();
    return user?.id || user?._id || null;
  }
  
  export function requireActiveUser() {
    const user = getActiveUser();
  
    if (!user) {
      alert("Debes iniciar sesión para continuar.");
      window.location.href = "/src/front/pages/login.html";
      return null;
    }
  
    return user;
  }