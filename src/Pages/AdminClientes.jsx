import { useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import Swal from "sweetalert2";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { AuthContext } from "../context/auth-context";
import { obtenerClientes } from "../services/api";

function AdminClientes() {
  const { user } = useContext(AuthContext);

  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await obtenerClientes();
        setClientes(data || []);
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "No se pudieron cargar los clientes.",
        });
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, []);

  if (user?.rol !== "admin") {
    return <Navigate to="/" replace />;
  }

  const formatearFecha = (fecha) => {
    if (!fecha) return "—";

    const f = new Date(fecha);

    if (Number.isNaN(f.getTime())) {
      return "—";
    }

    return f.toLocaleDateString("es-CO", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <>
      <Navbar />

      <main className="admin-page">
        <h1 className="admin-title">👥 Clientes</h1>
        <p className="admin-subtitle">
          Usuarios registrados de la cafetería
        </p>

        {loading ? (
          <p className="admin-loading">Cargando clientes...</p>
        ) : (
          <div className="tabla-contenedor">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Nombre de usuario</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Registro</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((cliente) => (
                  <tr key={cliente.id}>
                    <td>#{cliente.id}</td>
                    <td>
                      <strong>{cliente.nombre}</strong>
                    </td>
                    <td>{cliente.nombre_usuario || "—"}</td>
                    <td>{cliente.email}</td>
                    <td>
                      <span className="rol-badge rol-cliente">cliente</span>
                    </td>
                    <td>{formatearFecha(cliente.fecha_creacion)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}

export default AdminClientes;