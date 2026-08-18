import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import Navbar from "../components/Navbar";

const API_URL = "http://localhost:3000/api";

function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actualizando, setActualizando] = useState(null);

  // =====================================================
  // OBTENER PEDIDOS
  // =====================================================

  const obtenerPedidos = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/pedidos`);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "No se pudieron obtener los pedidos"
        );
      }

      setPedidos(data.pedidos || []);
    } catch (error) {
      console.error("❌ Error obteniendo pedidos:", error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.message ||
          "No se pudieron cargar los pedidos",
      });
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // CARGAR PEDIDOS AL ENTRAR
  // =====================================================

  useEffect(() => {
    obtenerPedidos();
  }, []);

  // =====================================================
  // CAMBIAR ESTADO DEL PEDIDO
  // =====================================================

  const cambiarEstado = async (pedidoId, estado) => {
    try {
      setActualizando(`pedido-${pedidoId}`);

      const response = await fetch(
        `${API_URL}/pedidos/${pedidoId}/estado`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            estado,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "No se pudo actualizar el estado del pedido"
        );
      }

      // Actualizar solamente el pedido modificado
      setPedidos((prevPedidos) =>
        prevPedidos.map((pedido) =>
          String(pedido.id) === String(pedidoId)
            ? {
                ...pedido,
                estado: data.pedido.estado,
              }
            : pedido
        )
      );

      Swal.fire({
        icon: "success",
        title: "Estado actualizado",
        text: `El pedido #${pedidoId} ahora está "${data.pedido.estado}".`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error(
        "❌ Error actualizando estado del pedido:",
        error
      );

      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.message ||
          "No se pudo actualizar el estado del pedido",
      });
    } finally {
      setActualizando(null);
    }
  };

  // =====================================================
  // CAMBIAR ESTADO DEL PAGO
  // =====================================================

  const cambiarEstadoPago = async (pagoId, estado) => {
    try {
      setActualizando(`pago-${pagoId}`);

      const response = await fetch(
        `${API_URL}/pagos/${pagoId}/estado`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            estado,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "No se pudo actualizar el estado del pago"
        );
      }

      // Actualizar solamente el pago modificado
      setPedidos((prevPedidos) =>
        prevPedidos.map((pedido) =>
          pedido.pago &&
          String(pedido.pago.id) === String(pagoId)
            ? {
                ...pedido,
                pago: {
                  ...pedido.pago,
                  estado: data.pago.estado,
                },
              }
            : pedido
        )
      );

      Swal.fire({
        icon: "success",
        title: "Pago actualizado",
        text: `El pago #${pagoId} ahora está "${data.pago.estado}".`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error(
        "❌ Error actualizando pago:",
        error
      );

      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.message ||
          "No se pudo actualizar el pago",
      });
    } finally {
      setActualizando(null);
    }
  };

  // =====================================================
  // CLASE DEL ESTADO DEL PEDIDO
  // =====================================================

  const obtenerClaseEstado = (estado) => {
    switch (estado) {
      case "pendiente":
        return "estado-pendiente";

      case "preparando":
        return "estado-preparando";

      case "listo":
        return "estado-listo";

      case "entregado":
        return "estado-entregado";

      case "cancelado":
        return "estado-cancelado";

      default:
        return "";
    }
  };

  // =====================================================
  // TEXTO DEL ESTADO DEL PEDIDO
  // =====================================================

  const obtenerTextoEstado = (estado) => {
    switch (estado) {
      case "pendiente":
        return "Pendiente";

      case "preparando":
        return "Preparando";

      case "listo":
        return "Listo";

      case "entregado":
        return "Entregado";

      case "cancelado":
        return "Cancelado";

      default:
        return estado || "Desconocido";
    }
  };

  // =====================================================
  // SIGUIENTE ESTADO DEL PEDIDO
  // =====================================================

  const siguienteEstado = (estado) => {
    switch (estado) {
      case "pendiente":
        return "preparando";

      case "preparando":
        return "listo";

      case "listo":
        return "entregado";

      default:
        return null;
    }
  };

  // =====================================================
  // FORMATEAR FECHA
  // =====================================================

  const formatearFecha = (fecha) => {
    if (!fecha) return "Sin fecha";

    const fechaFormateada = new Date(fecha);

    if (Number.isNaN(fechaFormateada.getTime())) {
      return "Fecha no válida";
    }

    return fechaFormateada.toLocaleString(
      "es-CO",
      {
        dateStyle: "short",
        timeStyle: "short",
      }
    );
  };

  // =====================================================
  // TEXTO DEL ESTADO DEL PAGO
  // =====================================================

  const obtenerTextoPago = (pago) => {
    if (!pago) {
      return "Sin pago";
    }

    switch (pago.estado) {
      case "pendiente":
        return "⏳ Pendiente";

      case "pagado":
        return "✅ Pagado";

      case "rechazado":
        return "❌ Rechazado";

      case "cancelado":
        return "🚫 Cancelado";

      default:
        return pago.estado || "Desconocido";
    }
  };

  // =====================================================
  // CARGANDO
  // =====================================================

  if (loading) {
    return (
      <>
        <Navbar />

        <div className="pedidos-page">
          <h1>Panel de Pedidos</h1>

          <div className="pedidos-loading">
            Cargando pedidos...
          </div>
        </div>
      </>
    );
  }

  // =====================================================
  // INTERFAZ
  // =====================================================

  return (
    <>
      <Navbar />

      <main className="pedidos-page">

        {/* =====================================================
            ENCABEZADO
        ===================================================== */}

        <div className="pedidos-header">
          <div>
            <h1>📋 Panel de Pedidos</h1>

            <p>
              Gestiona los pedidos y pagos de la cafetería.
            </p>
          </div>

          <button
            className="btn-primary"
            onClick={obtenerPedidos}
            disabled={loading || actualizando !== null}
          >
            🔄 Actualizar
          </button>
        </div>

        {/* =====================================================
            RESUMEN
        ===================================================== */}

        <div className="pedidos-resumen">

          <div className="resumen-card">
            <span>Total</span>

            <strong>
              {pedidos.length}
            </strong>
          </div>

          <div className="resumen-card">
            <span>Pendientes</span>

            <strong>
              {
                pedidos.filter(
                  (p) => p.estado === "pendiente"
                ).length
              }
            </strong>
          </div>

          <div className="resumen-card">
            <span>Preparando</span>

            <strong>
              {
                pedidos.filter(
                  (p) => p.estado === "preparando"
                ).length
              }
            </strong>
          </div>

          <div className="resumen-card">
            <span>Listos</span>

            <strong>
              {
                pedidos.filter(
                  (p) => p.estado === "listo"
                ).length
              }
            </strong>
          </div>

          <div className="resumen-card">
            <span>Pagos pendientes</span>

            <strong>
              {
                pedidos.filter(
                  (p) =>
                    p.pago &&
                    p.pago.estado === "pendiente"
                ).length
              }
            </strong>
          </div>

        </div>

        {/* =====================================================
            SIN PEDIDOS
        ===================================================== */}

        {pedidos.length === 0 ? (
          <div className="sin-pedidos">
            <h2>📭 No hay pedidos</h2>

            <p>
              Cuando un cliente realice un pedido,
              aparecerá aquí.
            </p>
          </div>
        ) : (

          /* =====================================================
             LISTA DE PEDIDOS
          ===================================================== */

          <div className="pedidos-grid">

            {pedidos.map((pedido) => {

              const siguiente = siguienteEstado(
                pedido.estado
              );

              const actualizandoPedido =
                actualizando ===
                `pedido-${pedido.id}`;

              const actualizandoPago =
                pedido.pago &&
                actualizando ===
                  `pago-${pedido.pago.id}`;

              return (
                <article
                  key={pedido.id}
                  className="pedido-card"
                >

                  {/* =====================================================
                      CABECERA DEL PEDIDO
                  ===================================================== */}

                  <div className="pedido-card-header">

                    <div>
                      <h2>
                        Pedido #{pedido.id}
                      </h2>

                      <span>
                        {formatearFecha(
                          pedido.fecha
                        )}
                      </span>
                    </div>

                    <span
                      className={`estado-badge ${obtenerClaseEstado(
                        pedido.estado
                      )}`}
                    >
                      {obtenerTextoEstado(
                        pedido.estado
                      )}
                    </span>

                  </div>

                  {/* =====================================================
                      INFORMACIÓN
                  ===================================================== */}

                  <div className="pedido-info">

                    <div>
                      <span>
                        🪑 Mesa
                      </span>

                      <strong>
                        {pedido.mesa ||
                          "Sin mesa"}
                      </strong>
                    </div>

                    <div>
                      <span>
                        👤 Cliente
                      </span>

                      <strong>
                        {pedido.cliente_id ||
                          "Cliente general"}
                      </strong>
                    </div>

                    <div>
                      <span>
                        💰 Total
                      </span>

                      <strong>
                        $
                        {Number(
                          pedido.total
                        ).toLocaleString(
                          "es-CO"
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>
                        💳 Pago
                      </span>

                      <strong>
                        {obtenerTextoPago(
                          pedido.pago
                        )}
                      </strong>
                    </div>

                  </div>

                  {/* =====================================================
                      INFORMACIÓN DEL PAGO
                  ===================================================== */}

                  {pedido.pago && (
                    <div className="pedido-pago">

                      <h3>
                        💳 Información del pago
                      </h3>

                      <div className="pago-info">

                        <div>
                          <span>
                            ID del pago
                          </span>

                          <strong>
                            #{pedido.pago.id}
                          </strong>
                        </div>

                        <div>
                          <span>
                            Método
                          </span>

                          <strong>
                            {pedido.pago.metodo}
                          </strong>
                        </div>

                        <div>
                          <span>
                            Estado
                          </span>

                          <strong>
                            {obtenerTextoPago(
                              pedido.pago
                            )}
                          </strong>
                        </div>

                        <div>
                          <span>
                            Fecha
                          </span>

                          <strong>
                            {formatearFecha(
                              pedido.pago.fecha
                            )}
                          </strong>
                        </div>

                      </div>

                    </div>
                  )}

                  {/* =====================================================
                      PRODUCTOS
                  ===================================================== */}

                  <div className="pedido-productos">

                    <h3>
                      Productos
                    </h3>

                    {pedido.detalles &&
                    pedido.detalles.length > 0 ? (

                      pedido.detalles.map(
                        (detalle) => (
                          <div
                            key={detalle.id}
                            className="pedido-producto"
                          >

                            <span>
                              {detalle.cantidad} ×
                              Producto #
                              {detalle.producto_id}
                            </span>

                            <strong>
                              $
                              {(
                                Number(
                                  detalle.precio
                                ) *
                                Number(
                                  detalle.cantidad
                                )
                              ).toLocaleString(
                                "es-CO"
                              )}
                            </strong>

                          </div>
                        )
                      )

                    ) : (

                      <p>
                        No hay detalles disponibles.
                      </p>

                    )}

                  </div>

                  {/* =====================================================
                      ACCIONES
                  ===================================================== */}

                  <div className="pedido-acciones">

                    {/* CAMBIAR ESTADO DEL PEDIDO */}

                    {siguiente && (
                      <button
                        className="btn-primary"
                        onClick={() =>
                          cambiarEstado(
                            pedido.id,
                            siguiente
                          )
                        }
                        disabled={
                          actualizando !== null
                        }
                      >
                        {actualizandoPedido
                          ? "Actualizando..."
                          : siguiente ===
                            "preparando"
                          ? "👨‍🍳 Preparar pedido"
                          : siguiente ===
                            "listo"
                          ? "✅ Marcar como listo"
                          : "📦 Marcar entregado"}
                      </button>
                    )}

                    {/* MARCAR PAGO COMO PAGADO */}

                    {pedido.pago &&
                      pedido.pago.estado ===
                        "pendiente" && (
                        <button
                          className="btn-success"
                          onClick={() =>
                            cambiarEstadoPago(
                              pedido.pago.id,
                              "pagado"
                            )
                          }
                          disabled={
                            actualizando !== null
                          }
                        >
                          {actualizandoPago
                            ? "Actualizando..."
                            : "💰 Marcar pago como pagado"}
                        </button>
                      )}

                    {/* PAGO YA PAGADO */}

                    {pedido.pago &&
                      pedido.pago.estado ===
                        "pagado" && (
                        <span className="pedido-finalizado">
                          ✅ Pago confirmado
                        </span>
                      )}

                    {/* PEDIDO ENTREGADO */}

                    {pedido.estado ===
                      "entregado" && (
                      <span className="pedido-finalizado">
                        ✅ Pedido entregado
                      </span>
                    )}

                    {/* PEDIDO CANCELADO */}

                    {pedido.estado ===
                      "cancelado" && (
                      <span className="pedido-finalizado">
                        🚫 Pedido cancelado
                      </span>
                    )}

                  </div>

                </article>
              );
            })}

          </div>
        )}

      </main>
    </>
  );
}

export default Pedidos;