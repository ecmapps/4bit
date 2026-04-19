export class AuthManager {
  constructor() {
    this.storageKey = "4bit_active_user";
  }

  getActiveUser() {
    const storedUser = localStorage.getItem(this.storageKey);
    return storedUser ? JSON.parse(storedUser) : null;
  }

  isUserActive() {
    return !!this.getActiveUser();
  }

  logout() {
    localStorage.removeItem(this.storageKey);
  }

  getUsername() {
    const user = this.getActiveUser();
    return user ? user.fullname : "Visitante";
  }
}

export const auth = new AuthManager();