import { useContext, useState } from "react";
import Swal from "sweetalert2";

import { CartContext } from "../context/cart-context";
import Navbar from "../components/Navbar";
import { crearPago } from "../services/api";

const ordenCategoria = {
  Comida: 1,
  Bebidas: 2,
  Postres: 3,
};

function Cart() {
  const {
    cart,
    increaseQty,
    decreaseQty,
    removeFromCart,
    clearCart,
    total,
    finalizarPedido,
    creatingOrder,
  } = useContext(CartContext);

  const [pago, setPago] = useState("efectivo");
  const [mesa, setMesa] = useState(null);
  const [procesando, setProcesando] = useState(false);

  const mesas = Array.from(
    { length: 10 },
    (_, i) => i + 1
  );

  // =========================================================
  // PRODUCTOS ORDENADOS
  // =========================================================

  const productosOrdenados = [...cart].sort((a, b) => {
    const ca = ordenCategoria[a.categoria] ?? 9;
    const cb = ordenCategoria[b.categoria] ?? 9;

    if (ca !== cb) {
      return ca - cb;
    }

    return String(a.nombre || "").localeCompare(
      String(b.nombre || ""),
      "es"
    );
  });

  // =========================================================
  // REALIZAR PEDIDO
  // =========================================================

  const realizarPedido = async () => {
    if (procesando || creatingOrder) {
      return;
    }

    // -------------------------------------------------------
    // VALIDAR CARRITO
    // -------------------------------------------------------

    if (cart.length === 0) {
      await Swal.fire({
        icon: "warning",
        title: "Carrito vacío",
        text:
          "Agrega productos antes de realizar el pedido.",
        confirmButtonText: "Aceptar",
      });

      return;
    }

    // -------------------------------------------------------
    // VALIDAR MESA
    // -------------------------------------------------------

    if (!mesa) {
      await Swal.fire({
        icon: "warning",
        title: "Selecciona una mesa",
        text:
          "Elige una de las mesas para realizar el pedido.",
        confirmButtonText: "Aceptar",
      });

      return;
    }

    // -------------------------------------------------------
    // VALIDAR PRODUCTOS
    // -------------------------------------------------------

    const productoInvalido = cart.find(
      (producto) =>
        producto.id == null ||
        Number(producto.cantidad) <= 0 ||
        Number(producto.precio) < 0
    );

    if (productoInvalido) {
      await Swal.fire({
        icon: "error",
        title: "Producto inválido",
        text:
          "Hay un producto inválido en el carrito. Elimina ese producto y vuelve a intentarlo.",
        confirmButtonText: "Aceptar",
      });

      return;
    }

    // -------------------------------------------------------
    // CONFIRMACIÓN
    // -------------------------------------------------------

    const resultado = await Swal.fire({
      icon: "question",
      title: "¿Confirmar pedido?",
      html: `
        <div style="text-align:left">
          <strong>Mesa:</strong> ${mesa}<br/>
          <strong>Total:</strong> $${Number(total).toLocaleString(
            "es-CO"
          )}<br/>
          <strong>Método de pago:</strong> ${
            pago === "transferencia"
              ? "Transferencia"
              : "Efectivo"
          }
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Sí, realizar pedido",
      cancelButtonText: "Cancelar",
    });

    if (!resultado.isConfirmed) {
      return;
    }

    setProcesando(true);

    try {
      // =====================================================
      // GUARDAR RESUMEN ANTES DE VACIAR
      // =====================================================

      const resumen = productosOrdenados
        .map((producto) => {
          const cantidad = Number(
            producto.cantidad || 0
          );

          const subtotal =
            Number(producto.precio || 0) *
            cantidad;

          return `
            ${cantidad} × ${producto.nombre}
            — $${subtotal.toLocaleString("es-CO")}
          `;
        })
        .join("<br/>");

      // =====================================================
      // 1. CREAR PEDIDO
      // =====================================================

      const respuestaPedido =
        await finalizarPedido({
          cliente_id: null,
          mesa,
        });

      console.log(
        "✅ Pedido creado:",
        respuestaPedido
      );

      const pedidoId =
        respuestaPedido?.pedido?.id;

      if (!pedidoId) {
        throw new Error(
          "El pedido fue creado, pero el servidor no devolvió su ID."
        );
      }

      // =====================================================
      // 2. CREAR PAGO
      // =====================================================

      let respuestaPago;

      try {
        respuestaPago = await crearPago({
          pedido_id: pedidoId,
          metodo: pago,
        });

        console.log(
          "✅ Pago creado:",
          respuestaPago
        );
      } catch (errorPago) {
        console.error(
          "❌ Error registrando el pago:",
          errorPago
        );

        // El pedido ya existe, pero el pago falló.
        await Swal.fire({
          icon: "warning",
          title: "Pedido creado",
          html: `
            <p>
              El pedido <strong>#${pedidoId}</strong>
              fue creado correctamente.
            </p>

            <p>
              Sin embargo, no se pudo registrar el pago.
            </p>

            <p>
              Guarda este número:
              <strong>#${pedidoId}</strong>
            </p>
          `,
          confirmButtonText: "Aceptar",
        });

        setMesa(null);
        setPago("efectivo");

        return;
      }

      // =====================================================
      // 3. CONFIRMACIÓN FINAL
      // =====================================================

      await Swal.fire({
        icon: "success",
        title: "¡Pedido realizado!",
        html: `
          <div style="text-align:left">

            <strong>Pedido #${pedidoId}</strong><br/>
            <strong>Mesa:</strong> ${mesa}<br/><br/>

            <strong>Productos:</strong><br/>

            ${resumen}

            <hr/>

            <strong>
              Total:
              $${Number(total).toLocaleString("es-CO")}
            </strong>

            <br/>

            <strong>
              Método de pago:
              ${
                pago === "transferencia"
                  ? "Transferencia"
                  : "Efectivo"
              }
            </strong>

            <br/>

            <strong>
              Estado del pago:
              Pendiente
            </strong>

          </div>
        `,
        confirmButtonText: "Aceptar",
      });

      // =====================================================
      // 4. REINICIAR FORMULARIO
      // =====================================================

      setMesa(null);
      setPago("efectivo");

      console.log(
        "✅ Pedido y pago registrados correctamente",
        {
          pedido: respuestaPedido,
          pago: respuestaPago,
        }
      );
    } catch (error) {
      console.error(
        "❌ Error realizando pedido:",
        error
      );

      await Swal.fire({
        icon: "error",
        title: "No se pudo realizar el pedido",
        text:
          error.message ||
          "Ocurrió un error al guardar el pedido.",
        confirmButtonText: "Aceptar",
      });
    } finally {
      setProcesando(false);
    }
  };

  // =========================================================
  // VACIAR CARRITO
  // =========================================================

  const confirmarVaciar = async () => {
    if (procesando || creatingOrder) {
      return;
    }

    const result = await Swal.fire({
      icon: "question",
      title: "¿Vaciar el carrito?",
      text:
        "Se eliminarán todos los productos.",
      showCancelButton: true,
      confirmButtonText: "Sí, vaciar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      clearCart();
      setMesa(null);

      Swal.fire({
        icon: "success",
        title: "Carrito vaciado",
        timer: 1000,
        showConfirmButton: false,
      });
    }
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <>
      <Navbar />

      <main className="cart-page">

        <h1>Carrito de Compras</h1>

        {cart.length === 0 ? (
          <div className="cart-empty">
            <p>
              Tu carrito está vacío.
            </p>

            <p>
              ¡Explora nuestro menú y encuentra
              tu antojo! ☕
            </p>
          </div>
        ) : (
          <>
            {/* =================================================
                PRODUCTOS
            ================================================= */}

            {productosOrdenados.map((producto) => (
              <div
                key={producto.id}
                className="cart-item"
              >

                <div className="cart-item-info">

                  <img
                    src={
                      producto.imagen ||
                      "/placeholder-producto.jpg"
                    }
                    alt={producto.nombre}
                  />

                  <div>
                    <h3>
                      {producto.nombre}
                    </h3>

                    <p>
                      $
                      {Number(
                        producto.precio || 0
                      ).toLocaleString("es-CO")}{" "}
                      c/u
                    </p>

                    {producto.categoria && (
                      <small>
                        {producto.categoria}
                      </small>
                    )}
                  </div>

                </div>

                {/* CANTIDAD */}

                <div className="cart-qty">

                  <button
                    type="button"
                    onClick={() =>
                      decreaseQty(producto.id)
                    }
                    disabled={
                      procesando ||
                      creatingOrder
                    }
                  >
                    -
                  </button>

                  <strong>
                    {producto.cantidad}
                  </strong>

                  <button
                    type="button"
                    onClick={() =>
                      increaseQty(producto.id)
                    }
                    disabled={
                      procesando ||
                      creatingOrder
                    }
                  >
                    +
                  </button>

                </div>

                {/* SUBTOTAL */}

                <div
                  style={{
                    textAlign: "right",
                  }}
                >

                  <h3
                    style={{
                      margin: 0,
                    }}
                  >
                    $
                    {(
                      Number(
                        producto.precio || 0
                      ) *
                      Number(
                        producto.cantidad || 0
                      )
                    ).toLocaleString(
                      "es-CO"
                    )}
                  </h3>

                  <button
                    type="button"
                    className="btn-danger"
                    onClick={() =>
                      removeFromCart(
                        producto.id
                      )
                    }
                    disabled={
                      procesando ||
                      creatingOrder
                    }
                  >
                    Eliminar
                  </button>

                </div>

              </div>
            ))}

            {/* =================================================
                TOTAL
            ================================================= */}

            <div className="cart-total">
              Total:{" "}
              <strong>
                $
                {Number(total).toLocaleString(
                  "es-CO"
                )}
              </strong>
            </div>

            {/* =================================================
                MESA
            ================================================= */}

            <section className="section-block">

              <h3>
                🪑 Elige tu mesa (1 - 10)
              </h3>

              <div className="table-grid">

                {mesas.map((numero) => (
                  <button
                    key={numero}
                    type="button"
                    className={`table-btn ${
                      mesa === numero
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      setMesa(numero)
                    }
                    disabled={
                      procesando ||
                      creatingOrder
                    }
                  >
                    Mesa {numero}
                  </button>
                ))}

              </div>

              {mesa && (
                <p>
                  Mesa seleccionada:
                  <strong> {mesa}</strong>
                </p>
              )}

            </section>

            {/* =================================================
                MÉTODO DE PAGO
            ================================================= */}

            <section className="section-block">

              <h3>
                💳 Método de pago
              </h3>

              <div className="radio-group">

                <label>
                  <input
                    type="radio"
                    name="pago"
                    value="efectivo"
                    checked={
                      pago === "efectivo"
                    }
                    onChange={(e) =>
                      setPago(
                        e.target.value
                      )
                    }
                    disabled={
                      procesando ||
                      creatingOrder
                    }
                  />

                  {" "}💵 Efectivo
                </label>

                <label>
                  <input
                    type="radio"
                    name="pago"
                    value="transferencia"
                    checked={
                      pago === "transferencia"
                    }
                    onChange={(e) =>
                      setPago(
                        e.target.value
                      )
                    }
                    disabled={
                      procesando ||
                      creatingOrder
                    }
                  />

                  {" "}🏦 Transferencia
                </label>

              </div>

            </section>

            {/* =================================================
                INFORMACIÓN TRANSFERENCIA
            ================================================= */}

            {pago === "transferencia" && (
              <div className="transfer-info">

                <strong>
                  Datos para la transferencia:
                </strong>

                <p>
                  Banco: Cafetería Elyon
                  <br />
                  Cuenta: 1234 5678 9012
                  <br />
                  Tipo: Ahorros
                </p>

                <small>
                  El pago quedará registrado como
                  pendiente hasta que sea confirmado.
                </small>

              </div>
            )}

            {/* =================================================
                ACCIONES
            ================================================= */}

            <div className="cart-actions">

              <button
                type="button"
                className="btn-primary"
                onClick={realizarPedido}
                disabled={
                  procesando ||
                  creatingOrder
                }
              >
                {procesando ||
                creatingOrder
                  ? "Guardando pedido..."
                  : "Realizar pedido"}
              </button>

              <button
                type="button"
                className="btn-outline"
                onClick={confirmarVaciar}
                disabled={
                  procesando ||
                  creatingOrder
                }
              >
                Vaciar carrito
              </button>

            </div>
          </>
        )}

      </main>
    </>
  );
}

export default Cart;
