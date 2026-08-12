import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import { AuthContext } from "../context/auth-context";

function Register() {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");

  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmar) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Las contraseñas no coinciden.",
      });
      return;
    }

    const res = register(usuario, password);
    if (res.ok) {
      Swal.fire({
        icon: "success",
        title: "Administrador registrado",
        timer: 1500,
        showConfirmButton: false,
      });
      navigate("/login");
    } else {
      Swal.fire({ icon: "error", title: "Error", text: res.msg });
    }
  };

  return (
    <div className="auth-page">
      <form onSubmit={handleSubmit} className="auth-card">
        <h2>Registrar Administrador</h2>

        <label>
          Usuario
          <input
            type="text"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            required
          />
        </label>

        <label>
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        <label style={{ marginBottom: "20px" }}>
          Confirmar contraseña
          <input
            type="password"
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
            required
          />
        </label>

        <button type="submit" className="btn-primary">
          Registrarse
        </button>

        <p className="auth-footer">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login">Iniciar sesión</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;