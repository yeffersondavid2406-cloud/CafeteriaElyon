import { useContext, useState } from "react";
import Swal from "sweetalert2";
import { CartContext } from "../context/cart-context";
import Navbar from "../components/Navbar";

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

  const mesas = Array.from({ length: 10 }, (_, i) => i + 1);

  const productosOrdenados = [...cart].sort((a, b) => {
    const ca = ordenCategoria[a.categoria] ?? 9;
    const cb = ordenCategoria[b.categoria] ?? 9;

    if (ca !== cb) {
      return ca - cb;
    }

    return a.nombre.localeCompare(b.nombre, "es");
  });

  // =========================================================
  // REALIZAR PEDIDO
  // =========================================================
  const realizarPedido = async () => {
    if (cart.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Carrito vacío",
        text: "Agrega productos antes de realizar el pedido.",
      });

      return;
    }

    if (!mesa) {
      Swal.fire({
        icon: "warning",
        title: "Selecciona una mesa",
        text: "Elige una de las mesas para realizar el pedido.",
      });

      return;
    }

    const resultado = await Swal.fire({
      icon: "question",
      title: "¿Confirmar pedido?",
      html: `
        <div style="text-align:left">
          <strong>Mesa: ${mesa}</strong><br/>
          <strong>Total: $${Number(total).toLocaleString("es-CO")}</strong><br/>
          <strong>Método de pago: ${
            pago === "transferencia"
              ? "Transferencia"
              : "Efectivo"
          }</strong>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Sí, realizar pedido",
      cancelButtonText: "Cancelar",
    });

    if (!resultado.isConfirmed) {
      return;
    }

    try {
      // Enviar el pedido al backend
      const respuesta = await finalizarPedido({
        cliente_id: null,
        mesa,
      });

      // Mostrar confirmación
      const resumen = productosOrdenados
        .map(
          (p) =>
            `${p.cantidad} x ${p.nombre}: $${(
              Number(p.precio) * p.cantidad
            ).toLocaleString("es-CO")}`
        )
        .join("<br/>");

      await Swal.fire({
        icon: "success",
        title: "Pedido realizado",
        html: `
          <div style="text-align:left">
            <strong>Pedido #${respuesta.pedido.id}</strong><br/>
            <strong>Mesa: ${mesa}</strong><br/>
            ${resumen}
            <hr/>
            <strong>Total: $${Number(total).toLocaleString(
              "es-CO"
            )}</strong><br/>
            <strong>Método de pago: ${
              pago === "transferencia"
                ? "Transferencia"
                : "Efectivo"
            }</strong>
          </div>
        `,
        confirmButtonText: "Aceptar",
      });

      // Volver a estado inicial
      setMesa(null);
      setPago("efectivo");
    } catch (error) {
      console.error("❌ Error realizando pedido:", error);

      Swal.fire({
        icon: "error",
        title: "No se pudo realizar el pedido",
        text:
          error.message ||
          "Ocurrió un error al guardar el pedido.",
        confirmButtonText: "Aceptar",
      });
    }
  };

  // =========================================================
  // VACIAR CARRITO
  // =========================================================
  const confirmarVaciar = () => {
    Swal.fire({
      icon: "question",
      title: "¿Vaciar el carrito?",
      text: "Se eliminarán todos los productos.",
      showCancelButton: true,
      confirmButtonText: "Sí, vaciar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        clearCart();
        setMesa(null);
      }
    });
  };

  return (
    <>
      <Navbar />

      <div className="cart-page">
        <h1>Carrito de Compras</h1>

        {cart.length === 0 ? (
          <p className="cart-empty">
            Tu carrito está vacío. ¡Explora nuestro menú y
            encuentra tu antojo!
          </p>
        ) : (
          <>
            {productosOrdenados.map((producto) => (
              <div key={producto.id} className="cart-item">
                <div className="cart-item-info">
                  <img
                    src={
                      producto.imagen ||
                      "/placeholder-producto.jpg"
                    }
                    alt={producto.nombre}
                  />

                  <div>
                    <h3>{producto.nombre}</h3>

                    <p>
                      $
                      {Number(producto.precio).toLocaleString(
                        "es-CO"
                      )}{" "}
                      c/u
                    </p>
                  </div>
                </div>

                <div className="cart-qty">
                  <button
                    onClick={() => decreaseQty(producto.id)}
                  >
                    -
                  </button>

                  <strong>{producto.cantidad}</strong>

                  <button
                    onClick={() => increaseQty(producto.id)}
                  >
                    +
                  </button>
                </div>

                <div style={{ textAlign: "right" }}>
                  <h3 style={{ margin: 0 }}>
                    $
                    {(
                      Number(producto.precio) *
                      producto.cantidad
                    ).toLocaleString("es-CO")}
                  </h3>

                  <button
                    className="btn-danger"
                    onClick={() =>
                      removeFromCart(producto.id)
                    }
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}

            <div className="cart-total">
              Total:{" "}
              <strong>
                ${Number(total).toLocaleString("es-CO")}
              </strong>
            </div>

            {/* ================================================= */}
            {/* MESA */}
            {/* ================================================= */}

            <div className="section-block">
              <h3>🪑 Elige tu mesa (1 - 10)</h3>

              <div className="table-grid">
                {mesas.map((numero) => (
                  <button
                    key={numero}
                    className={`table-btn ${
                      mesa === numero ? "active" : ""
                    }`}
                    onClick={() => setMesa(numero)}
                    type="button"
                  >
                    Mesa {numero}
                  </button>
                ))}
              </div>
            </div>

            {/* ================================================= */}
            {/* PAGO */}
            {/* ================================================= */}

            <div className="section-block">
              <h3>💳 Método de pago</h3>

              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    name="pago"
                    value="efectivo"
                    checked={pago === "efectivo"}
                    onChange={(e) =>
                      setPago(e.target.value)
                    }
                  />
                  {" "}💵 Efectivo
                </label>

                <label>
                  <input
                    type="radio"
                    name="pago"
                    value="transferencia"
                    checked={pago === "transferencia"}
                    onChange={(e) =>
                      setPago(e.target.value)
                    }
                  />
                  {" "}🏦 Transferencia
                </label>
              </div>
            </div>

            {pago === "transferencia" && (
              <div className="transfer-info">
                <strong>
                  Datos para la transferencia:
                </strong>

                <p>
                  Banco: Cafetería Elyon · Cuenta:
                  1234 5678 9012 · Ahorros
                </p>
              </div>
            )}

            {/* ================================================= */}
            {/* ACCIONES */}
            {/* ================================================= */}

            <div className="cart-actions">
              <button
                className="btn-primary"
                onClick={realizarPedido}
                disabled={creatingOrder}
              >
                {creatingOrder
                  ? "Guardando pedido..."
                  : "Realizar pedido"}
              </button>

              <button
                className="btn-outline"
                onClick={confirmarVaciar}
                disabled={creatingOrder}
              >
                Vaciar carrito
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default Cart;