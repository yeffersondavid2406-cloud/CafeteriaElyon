import { useEffect, useState } from "react";
import { AuthContext } from "./auth-context";

const USERS_KEY = "elyon-admin-users";
const SESSION_KEY = "elyon-admin-session";

function loadJSON(key) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(() => loadJSON(USERS_KEY) ?? []);
  const [admin, setAdmin] = useState(() => loadJSON(SESSION_KEY));

  useEffect(() => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(admin));
  }, [admin]);

  const register = (usuario, password) => {
    if (!usuario.trim() || !password.trim()) {
      return { ok: false, msg: "Completa todos los campos." };
    }
    if (users.find((u) => u.usuario === usuario)) {
      return { ok: false, msg: "El usuario administrador ya existe." };
    }
    setUsers((prev) => [...prev, { usuario, password }]);
    return { ok: true };
  };

  const login = (usuario, password) => {
    const found = users.find(
      (u) => u.usuario === usuario && u.password === password
    );
    if (!found) {
      return { ok: false, msg: "Usuario o contraseña incorrectos." };
    }
    setAdmin(found);
    return { ok: true };
  };

  const logout = () => setAdmin(null);

  return (
    <AuthContext.Provider value={{ admin, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}