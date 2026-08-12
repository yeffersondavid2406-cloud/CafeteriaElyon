import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import { AuthContext } from "../context/auth-context";

function Login() {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const res = login(usuario, password);
    if (res.ok) {
      Swal.fire({
        icon: "success",
        title: "Bienvenido",
        timer: 1200,
        showConfirmButton: false,
      });
      navigate("/admin");
    } else {
      Swal.fire({ icon: "error", title: "Error", text: res.msg });
    }
  };

  return (
    <div className="auth-page">
      <form onSubmit={handleSubmit} className="auth-card">
        <h2>Acceso Administrador</h2>

        <label>
          Usuario
          <input
            type="text"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            required
          />
        </label>

        <label style={{ marginBottom: "20px" }}>
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        <button type="submit" className="btn-primary">
          Iniciar sesión
        </button>

        <p className="auth-footer">
          ¿Primera vez?{" "}
          <Link to="/registro">Registrar administrador</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;