import { useContext, useEffect, useState } from "react";
import { Navigate, useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";

import { AuthContext } from "../context/auth-context";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { obtenerDashboard } from "../services/api";

function Admin() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.rol !== "admin") {
      return;
    }

    const cargar = async () => {
      try {
        const data = await obtenerDashboard();
        setDashboard(data);
      } catch (error) {
        console.error("❌ Error cargando dashboard:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "No se pudo cargar el dashboard.",
        });
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, [user]);

  if (!user || user.rol !== "admin") {
    return <Navigate to="/" replace />;
  }

  const handleLogout = () => {
    Swal.fire({
      icon: "question",
      title: "¿Cerrar sesión?",
      showCancelButton: true,
      confirmButtonText: "Sí, salir",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        await logout();
        navigate("/");
      }
    });
  };

  const formatoMoneda = (valor) =>
    Number(valor || 0).toLocaleString("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    });

  const tarjetas = dashboard
    ? [
        { etiqueta: "Total pedidos", valor: dashboard.totalPedidos, icono: "📋" },
        { etiqueta: "Pendientes", valor: dashboard.pendientes, icono: "⏳" },
        { etiqueta: "En preparación", valor: dashboard.preparando, icono: "👨‍🍳" },
        { etiqueta: "Listos", valor: dashboard.listos, icono: "✅" },
        { etiqueta: "Entregados", valor: dashboard.entregados, icono: "📦" },
        { etiqueta: "Cancelados", valor: dashboard.cancelados, icono: "🚫" },
        { etiqueta: "Ventas", valor: formatoMoneda(dashboard.ventas), icono: "💰" },
        { etiqueta: "Clientes", valor: dashboard.totalClientes, icono: "👥" },
        { etiqueta: "Productos", valor: dashboard.totalProductos, icono: "🍽️" },
        { etiqueta: "Pagos pendientes", valor: dashboard.pagosPendientes, icono: "💳" },
      ]
    : [];

  return (
    <>
      <Navbar />

      <div className="admin-page">
        <h1 className="admin-title">Panel de Administración</h1>
        <p className="admin-subtitle">
          Gestiona pedidos, productos y clientes de la cafetería
        </p>

        <div className="admin-panel">
          <p className="admin-greeting">
            Sesión iniciada como{" "}
            <strong>{user.nombre_usuario || user.nombre}</strong> 👋
          </p>

          <div className="admin-actions">
            <Link to="/admin/pedidos" className="btn-outline">
              📋 Pedidos
            </Link>
            <Link to="/admin/productos" className="btn-outline">
              🍽️ Productos
            </Link>
            <Link to="/admin/clientes" className="btn-outline">
              👥 Clientes
            </Link>
            <button className="btn-danger-lg" onClick={handleLogout}>
              Cerrar sesión
            </button>
          </div>

          {loading ? (
            <p className="admin-loading">Cargando datos...</p>
          ) : (
            <div className="admin-stats">
              {tarjetas.map((card) => (
                <div key={card.etiqueta} className="stat-card">
                  <span className="icono">{card.icono}</span>
                  <span className="valor">{card.valor}</span>
                  <span className="etiqueta">{card.etiqueta}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}

export default Admin;