import { useEffect, useState, useCallback } from "react";
import { AuthContext } from "./auth-context";
import {
  getToken,
  setToken,
  clearToken,
  registerUser,
  loginUser,
  logout as apiLogout,
  obtenerUsuarioActual,
  actualizarPerfil,
} from "../services/api";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // =====================================================
  // RESTAURAR SESIÓN AL RECARGAR
  // =====================================================

  useEffect(() => {
    const restaurarSesion = async () => {
      if (!getToken()) {
        setLoading(false);
        return;
      }

      try {
        const data = await obtenerUsuarioActual();
        setUser(data.user);
      } catch {
        clearToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restaurarSesion();
  }, []);

  // =====================================================
  // REGISTRO
  // =====================================================

  const register = useCallback(
    async ({ nombre, nombre_usuario, email, password }) => {
      const data = await registerUser({
        nombre,
        nombre_usuario,
        email,
        password,
      });

      setToken(data.token);
      setUser(data.user);

      return data;
    },
    []
  );

  // =====================================================
  // LOGIN
  // =====================================================

  const login = useCallback(async (identificador, password) => {
    const data = await loginUser({ identificador, password });

    setToken(data.token);
    setUser(data.user);

    return data;
  }, []);

  // =====================================================
  // ACTUALIZAR PERFIL (nombre_usuario, nombre)
  // =====================================================

  const updateProfile = useCallback(async (datos) => {
    const data = await actualizarPerfil(datos);

    setUser(data.user);

    return data;
  }, []);

  // =====================================================
  // LOGOUT
  // =====================================================

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch {
      // El backend no guarda sesión: no es un error grave
    }

    clearToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        updateProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}