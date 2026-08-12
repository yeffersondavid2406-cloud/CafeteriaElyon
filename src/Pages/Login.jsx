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
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(120deg,#1e3a8a,#2563eb)",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: "white",
          padding: "35px 40px",
          borderRadius: "12px",
          width: "360px",
          boxShadow: "0 10px 30px rgba(0,0,0,.25)",
        }}
      >
        <h2 style={{ marginTop: 0, color: "#1e3a8a", textAlign: "center" }}>
          Acceso Administrador
        </h2>

        <label style={{ display: "block", marginBottom: "14px" }}>
          Usuario
          <input
            type="text"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "4px",
              borderRadius: "6px",
              border: "1px solid #cbd5e1",
            }}
          />
        </label>

        <label style={{ display: "block", marginBottom: "20px" }}>
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "4px",
              borderRadius: "6px",
              border: "1px solid #cbd5e1",
            }}
          />
        </label>

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "12px",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          Iniciar sesión
        </button>

        <p style={{ textAlign: "center", marginTop: "16px" }}>
          ¿Primera vez?{" "}
          <Link to="/registro" style={{ color: "#2563eb" }}>
            Registrar administrador
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Login;