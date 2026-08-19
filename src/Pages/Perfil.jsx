import { useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import Swal from "sweetalert2";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { AuthContext } from "../context/auth-context";
import { obtenerMisPedidos } from "../services/api";

const ESTADOS = {
  pendiente: { texto: "Pendiente", clase: "estado-pendiente" },
  preparando: { texto: "Preparando", clase: "estado-preparando" },
  listo: { texto: "Listo", clase: "estado-listo" },
  entregado: { texto: "Entregado", clase: "estado-entregado" },
  cancelado: { texto: "Cancelado", clase: "estado-cancelado" },
};

function Perfil() {
  const { user, updateProfile } = useContext(AuthContext);

  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editandoUsuario, setEditandoUsuario] = useState(false);
  const [nuevoUsuario, setNuevoUsuario] = useState("");

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await obtenerMisPedidos();
        setPedidos(data || []);
      } catch (error) {
        console.error("❌ Error cargando mis pedidos:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "No se pudieron cargar tus pedidos.",
        });
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, []);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const guardarUsuario = async () => {
    if (!nuevoUsuario.trim() || nuevoUsuario.trim().length < 3) {
      Swal.fire({
        icon: "warning",
        title: "Nombre de usuario inválido",
        text: "Debe tener al menos 3 caracteres.",
      });
      return;
    }

    try {
      await updateProfile({ nombre_usuario: nuevoUsuario.trim() });
      setEditandoUsuario(false);
      Swal.fire({
        icon: "success",
        title: "Nombre de usuario actualizado",
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "No se pudo actualizar el nombre de usuario.",
      });
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "Sin fecha";

    const f = new Date(fecha);

    if (Number.isNaN(f.getTime())) return "Fecha no válida";

    return f.toLocaleString("es-CO", {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  const formatearTotal = (total) =>
    Number(total || 0).toLocaleString("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    });

  return (
    <>
      <Navbar />

      <main className="perfil-page">
        <h1 className="perfil-title">Mi Perfil</h1>

        <section className="perfil-tarjeta">
          <div className="perfil-avatar">👤</div>

          <div className="perfil-datos">
            <h2>{user.nombre || "Sin nombre"}</h2>

            <p>
              <strong>Nombre de usuario:</strong>{" "}
              {user.nombre_usuario || "No definido"}
              {!user.nombre_usuario && (
                <em className="perfil-aviso">
                  {" "}
                  (necesitas uno para hacer pedidos)
                </em>
              )}
            </p>

            <p>
              <strong>Email:</strong> {user.email}
            </p>

            <p>
              <strong>Rol:</strong>{" "}
              <span className="rol-badge rol-cliente">
                {user.rol}
              </span>
            </p>
          </div>

          {!user.nombre_usuario ? (
            <div className="perfil-edicion">
              <h3>Elige tu nombre de usuario</h3>

              <input
                type="text"
                placeholder="ej. Juan123"
                value={nuevoUsuario}
                onChange={(e) => setNuevoUsuario(e.target.value)}
              />

              <button className="btn-primary" onClick={guardarUsuario}>
                Guardar
              </button>
            </div>
          ) : editandoUsuario ? (
            <div className="perfil-edicion">
              <h3>Cambiar nombre de usuario</h3>

              <input
                type="text"
                value={nuevoUsuario}
                onChange={(e) => setNuevoUsuario(e.target.value)}
              />

              <button className="btn-primary" onClick={guardarUsuario}>
                Guardar
              </button>

              <button className="btn-outline" onClick={() => setEditandoUsuario(false)}>
                Cancelar
              </button>
            </div>
          ) : (
            <button
              className="btn-outline"
              onClick={() => {
                setNuevoUsuario(user.nombre_usuario || "");
                setEditandoUsuario(true);
              }}
            >
              Cambiar nombre de usuario
            </button>
          )}
        </section>

        <section className="perfil-pedidos">
          <h2>📦 Mis pedidos</h2>

          {loading ? (
            <p className="admin-loading">Cargando pedidos...</p>
          ) : pedidos.length === 0 ? (
            <p className="sin-pedidos">Aún no has realizado pedidos.</p>
          ) : (
            <div className="pedidos-grid">
              {pedidos.map((pedido) => {
                const estado = ESTADOS[pedido.estado] || {
                  texto: pedido.estado,
                  clase: "",
                };

                return (
                  <article key={pedido.id} className="pedido-card">
                    <div className="pedido-card-header">
                      <div>
                        <h2>Pedido #{pedido.id}</h2>
                        <span>{formatearFecha(pedido.fecha)}</span>
                      </div>

                      <span className={`estado-badge ${estado.clase}`}>
                        {estado.texto}
                      </span>
                    </div>

                    <div className="pedido-info">
                      <div>
                        <span>🪑 Mesa</span>
                        <strong>{pedido.mesa || "Sin mesa"}</strong>
                      </div>

                      <div>
                        <span>💰 Total</span>
                        <strong>{formatearTotal(pedido.total)}</strong>
                      </div>

                      <div>
                        <span>💳 Pago</span>
                        <strong>
                          {pedido.pago ? pedido.pago.estado : "Sin pago"}
                        </strong>
                      </div>
                    </div>

                    {pedido.detalles?.length > 0 && (
                      <div className="pedido-productos">
                        <h3>Productos</h3>

                        {pedido.detalles.map((detalle) => (
                          <div key={detalle.id} className="pedido-producto">
                            <span>
                              {detalle.cantidad} × Producto #{detalle.producto_id}
                            </span>
                            <strong>
                              {formatearTotal(
                                Number(detalle.precio) * Number(detalle.cantidad)
                              )}
                            </strong>
                          </div>
                        ))}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}

export default Perfil;