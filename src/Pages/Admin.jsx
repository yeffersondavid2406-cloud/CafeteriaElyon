import { useContext } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import { AuthContext } from "../context/auth-context";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Admin() {
  const { admin, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  if (!admin) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    Swal.fire({
      icon: "question",
      title: "¿Cerrar sesión?",
      showCancelButton: true,
      confirmButtonText: "Sí, salir",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        navigate("/");
      }
    });
  };

  return (
    <>
      <Navbar />

      <div style={{ padding: "40px", textAlign: "center" }}>
        <h1 style={{ color: "#1e3a8a" }}>Panel de Administración</h1>

        <div
          style={{
            background: "white",
            maxWidth: "500px",
            margin: "30px auto",
            padding: "30px",
            borderRadius: "12px",
            boxShadow: "0 4px 15px rgba(30,58,138,.12)",
          }}
        >
          <p>
            Sesión iniciada como{" "}
            <strong style={{ color: "#2563eb" }}>{admin.usuario}</strong>
          </p>
          <p>
            Desde aquí el administrador podrá gestionar los productos y
            pedidos de la cafetería.
          </p>

          <button
            onClick={handleLogout}
            style={{
              background: "#dc2626",
              color: "white",
              border: "none",
              padding: "12px 25px",
              borderRadius: "8px",
              fontSize: "16px",
              cursor: "pointer",
              marginTop: "10px",
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default Admin;