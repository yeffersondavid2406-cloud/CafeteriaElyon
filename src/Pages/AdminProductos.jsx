import { useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import Swal from "sweetalert2";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { AuthContext } from "../context/auth-context";
import {
  obtenerProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
} from "../services/api";

const VACIO = {
  nombre: "",
  precio: "",
  categoria: "",
  descripcion: "",
  imagen: "",
  destacado: false,
  disponible: true,
};

function AdminProductos() {
  const { user } = useContext(AuthContext);

  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formulario, setFormulario] = useState(VACIO);
  const [editandoId, setEditandoId] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
    try {
      setLoading(true);
      const data = await obtenerProductos();
      setProductos(data || []);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "No se pudieron cargar los productos.",
      });
    } finally {
      setLoading(false);
    }
  };

  const cambiar = (campo, valor) =>
    setFormulario((prev) => ({ ...prev, [campo]: valor }));

  const empezarEdicion = (producto) => {
    setEditandoId(producto.id);
    setFormulario({
      nombre: producto.nombre || "",
      precio: producto.precio ?? "",
      categoria: producto.categoria || "",
      descripcion: producto.descripcion || "",
      imagen: producto.imagen || "",
      destacado: producto.destacado === true,
      disponible: producto.disponible !== false,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setFormulario(VACIO);
    setShowForm(false);
  };

  const guardar = async (e) => {
    e.preventDefault();

    if (!formulario.nombre.trim() || formulario.precio === "") {
      Swal.fire({
        icon: "warning",
        title: "Campos obligatorios",
        text: "Nombre y precio son obligatorios.",
      });
      return;
    }

    setGuardando(true);

    try {
      const payload = {
        nombre: formulario.nombre.trim(),
        precio: Number(formulario.precio),
        categoria: formulario.categoria.trim() || "General",
        descripcion: formulario.descripcion.trim() || null,
        imagen: formulario.imagen.trim() || null,
        destacado: formulario.destacado,
        disponible: formulario.disponible,
      };

      if (editandoId) {
        await actualizarProducto(editandoId, payload);
        Swal.fire({
          icon: "success",
          title: "Producto actualizado",
          timer: 1200,
          showConfirmButton: false,
        });
      } else {
        await crearProducto(payload);
        Swal.fire({
          icon: "success",
          title: "Producto creado",
          timer: 1200,
          showConfirmButton: false,
        });
      }

      cancelarEdicion();
      await cargar();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "No se pudo guardar el producto.",
      });
    } finally {
      setGuardando(false);
    }
  };

  const confirmarEliminar = async (producto) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "¿Eliminar producto?",
      text: `${producto.nombre} se eliminará. Esta acción no se puede deshacer.`,
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      await eliminarProducto(producto.id);
      Swal.fire({
        icon: "success",
        title: "Producto eliminado",
        timer: 1200,
        showConfirmButton: false,
      });
      await cargar();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "No se pudo eliminar el producto.",
      });
    }
  };

  const alternarDestacado = async (producto) => {
    try {
      await actualizarProducto(producto.id, {
        destacado: !producto.destacado,
      });
      await cargar();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "No se pudo cambiar el producto.",
      });
    }
  };

  const alternarDisponible = async (producto) => {
    try {
      await actualizarProducto(producto.id, {
        disponible: !producto.disponible,
      });
      await cargar();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "No se pudo cambiar el producto.",
      });
    }
  };

  if (user?.rol !== "admin") {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <Navbar />

      <main className="admin-page">
        <div className="admin-header-row">
          <div>
            <h1 className="admin-title">🍽️ Productos</h1>
            <p className="admin-subtitle">
              Crea, edita y administra los productos de la cafetería
            </p>
          </div>

          <button
            className="btn-primary"
            onClick={() =>
              setShowForm((prev) => {
                if (prev) cancelarEdicion();
                return !prev;
              })
            }
          >
            {showForm ? "Cerrar formulario" : "➕ Nuevo producto"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={guardar} className="producto-form">
            <h3>{editandoId ? `Editar producto #${editandoId}` : "Nuevo producto"}</h3>

            <div className="producto-form-grid">
              <label>
                Nombre *
                <input
                  type="text"
                  value={formulario.nombre}
                  onChange={(e) => cambiar("nombre", e.target.value)}
                  required
                />
              </label>

              <label>
                Precio (COP) *
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={formulario.precio}
                  onChange={(e) => cambiar("precio", e.target.value)}
                  required
                />
              </label>

              <label>
                Categoría *
                <input
                  type="text"
                  value={formulario.categoria}
                  onChange={(e) => cambiar("categoria", e.target.value)}
                  placeholder="ej. Comida, Bebidas, Postres"
                  required
                />
              </label>

              <label>
                Imagen (URL)
                <input
                  type="text"
                  value={formulario.imagen}
                  onChange={(e) => cambiar("imagen", e.target.value)}
                  placeholder="https://..."
                />
              </label>
            </div>

            <label>
              Descripción
              <textarea
                value={formulario.descripcion}
                onChange={(e) => cambiar("descripcion", e.target.value)}
                rows="2"
              />
            </label>

            <div className="producto-form-checks">
              <label className="checkbox-line">
                <input
                  type="checkbox"
                  checked={formulario.destacado}
                  onChange={(e) => cambiar("destacado", e.target.checked)}
                />
                ⭐ Destacado
              </label>

              <label className="checkbox-line">
                <input
                  type="checkbox"
                  checked={formulario.disponible}
                  onChange={(e) => cambiar("disponible", e.target.checked)}
                />
                Disponible
              </label>
            </div>

            <div className="producto-form-actions">
              <button type="submit" className="btn-primary" disabled={guardando}>
                {guardando ? "Guardando..." : editandoId ? "Guardar cambios" : "Crear producto"}
              </button>
              <button type="button" className="btn-outline" onClick={cancelarEdicion}>
                Cancelar
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <p className="admin-loading">Cargando productos...</p>
        ) : (
          <div className="tabla-contenedor">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Destacado</th>
                  <th>Disponible</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((producto) => (
                  <tr key={producto.id}>
                    <td>#{producto.id}</td>
                    <td>
                      <strong>{producto.nombre}</strong>
                    </td>
                    <td>{producto.categoria}</td>
                    <td>
                      {Number(producto.precio).toLocaleString("es-CO", {
                        style: "currency",
                        currency: "COP",
                        minimumFractionDigits: 0,
                      })}
                    </td>
                    <td>
                      <button
                        className={`btn-mini ${producto.destacado ? "on" : ""}`}
                        onClick={() => alternarDestacado(producto)}
                        title="Cambiar destacado"
                      >
                        {producto.destacado ? "⭐ Sí" : "☆ No"}
                      </button>
                    </td>
                    <td>
                      <button
                        className={`btn-mini ${producto.disponible ? "on" : "off"}`}
                        onClick={() => alternarDisponible(producto)}
                        title="Activar/desactivar"
                      >
                        {producto.disponible ? "✅ Activo" : "⛔ Inactivo"}
                      </button>
                    </td>
                    <td className="acciones">
                      <button className="btn-outline" onClick={() => empezarEdicion(producto)}>
                        Editar
                      </button>
                      <button className="btn-danger" onClick={() => confirmarEliminar(producto)}>
                        Eliminar
                      </button>
                    </td>
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

export default AdminProductos;