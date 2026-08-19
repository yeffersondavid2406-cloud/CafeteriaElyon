import { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import { AuthContext } from "../context/auth-context";

function Login() {
  const [identificador, setIdentificador] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);

  const { user, loading: authLoading, login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const destino = location.state?.from?.pathname || null;

  // =====================================================
  // NAVEGACIÓN SEGÚN EL ESTADO REAL DE SESIÓN
  // Se ejecuta solo cuando el contexto ya tiene el usuario
  // cargado, evitando redirigir antes de tiempo.
  // =====================================================

  useEffect(() => {
    if (authLoading || !user) {
      return;
    }

    if (user.rol === "admin") {
      navigate("/admin", { replace: true });
    } else if (destino) {
      navigate(destino, { replace: true });
    } else {
      navigate("/menu", { replace: true });
    }
  }, [user, authLoading, destino, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!identificador.trim() || !password.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Ingresa tu usuario/email y tu contraseña.",
      });
      return;
    }

    setCargando(true);

    try {
      await login(identificador.trim(), password);

      // No se navega aquí: el useEffect lo hace cuando el
      // contexto tenga la sesión real cargada.
      Swal.fire({
        icon: "success",
        title: "¡Bienvenido!",
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "No se pudo iniciar sesión.",
      });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="auth-page">
      <form onSubmit={handleSubmit} className="auth-card">
        <h2>Iniciar sesión</h2>

        <label>
          Email o nombre de usuario
          <input
            type="text"
            value={identificador}
            onChange={(e) => setIdentificador(e.target.value)}
            placeholder="ej. admin o tu@correo.com"
            autoComplete="username"
            required
          />
        </label>

        <label style={{ marginBottom: "16px" }}>
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        <button type="submit" className="btn-primary" disabled={cargando}>
          {cargando ? "Ingresando..." : "Iniciar sesión"}
        </button>

        <p className="auth-footer">
          ¿No tienes cuenta?{" "}
          <Link to="/registro">Regístrate aquí</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;