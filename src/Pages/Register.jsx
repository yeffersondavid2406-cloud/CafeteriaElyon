import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { AuthContext } from "../context/auth-context";

function Register() {
  const [nombre, setNombre] = useState("");
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [cargando, setCargando] = useState(false);

  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const validar = () => {
    if (!nombre.trim() || !nombreUsuario.trim() || !email.trim() || !password) {
      return "Completa todos los campos.";
    }

    if (nombreUsuario.trim().length < 3) {
      return "El nombre de usuario debe tener al menos 3 caracteres.";
    }

    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

    if (!emailValido) {
      return "El email no es válido.";
    }

    if (password.length < 6) {
      return "La contraseña debe tener al menos 6 caracteres.";
    }

    if (password !== confirmar) {
      return "Las contraseñas no coinciden.";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errorValidacion = validar();

    if (errorValidacion) {
      Swal.fire({
        icon: "warning",
        title: "Verifica tus datos",
        text: errorValidacion,
      });
      return;
    }

    setCargando(true);

    try {
      await register({
        nombre: nombre.trim(),
        nombre_usuario: nombreUsuario.trim(),
        email: email.trim(),
        password,
      });

      Swal.fire({
        icon: "success",
        title: "¡Registro exitoso!",
        text: "Tu cuenta fue creada. ¡Bienvenido a Cafetería Elyon!",
        timer: 1500,
        showConfirmButton: false,
      });

      navigate("/menu");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "No se pudo completar el registro.",
      });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="auth-page">
      <form onSubmit={handleSubmit} className="auth-card">
        <h2>Crear cuenta</h2>

        <label>
          Nombre completo
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="ej. Juan Pérez"
            required
          />
        </label>

        <label>
          Nombre de usuario
          <input
            type="text"
            value={nombreUsuario}
            onChange={(e) => setNombreUsuario(e.target.value)}
            placeholder="ej. Juan123"
            required
          />
        </label>

        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ej. juan@correo.com"
            autoComplete="email"
            required
          />
        </label>

        <label>
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
        </label>

        <label style={{ marginBottom: "16px" }}>
          Confirmar contraseña
          <input
            type="password"
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
            autoComplete="new-password"
            required
          />
        </label>

        <button type="submit" className="btn-primary" disabled={cargando}>
          {cargando ? "Registrando..." : "Registrarme"}
        </button>

        <p className="auth-footer">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login">Inicia sesión</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;