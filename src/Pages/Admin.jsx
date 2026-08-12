import { useContext } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import { AuthContext } from "../context/auth-context";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import products from "../data/products";

function Admin() {
  const { admin, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  if (!admin) {
    return <Navigate to="/login" replace />;
  }

  const categorias = [...new Set(products.map((p) => p.categoria))];
  const destacados = products.filter((p) => p.destacado).length;

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

      <div className="admin-page">
        <h1 className="admin-title">Panel de Administración</h1>
        <p className="admin-subtitle">
          Gestiona los productos y pedidos de la cafetería con facilidad
        </p>

        <div className="admin-panel">
          <p className="admin-greeting">
            Sesión iniciada como{" "}
            <strong>{admin.usuario}</strong> 👋
          </p>

          <div className="admin-stats">
            <div className="stat-card">
              <span className="icono">🍽️</span>
              <span className="valor">{products.length}</span>
              <span className="etiqueta">Productos</span>
            </div>

            <div className="stat-card">
              <span className="icono">🏷️</span>
              <span className="valor">{categorias.length}</span>
              <span className="etiqueta">Categorías</span>
            </div>

            <div className="stat-card">
              <span className="icono">⭐</span>
              <span className="valor">{destacados}</span>
              <span className="etiqueta">Destacados</span>
            </div>
          </div>

          <div className="admin-actions">
            <button className="btn-outline" onClick={() => navigate("/menu")}>
              Revisar productos
            </button>
            <button className="btn-danger-lg" onClick={handleLogout}>
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default Admin;