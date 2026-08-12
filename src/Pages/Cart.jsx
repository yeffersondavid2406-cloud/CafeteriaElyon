import { useContext, useState } from "react";
import Swal from "sweetalert2";
import { CartContext } from "../context/cart-context";
import Navbar from "../components/Navbar";

const ordenCategoria = { Comida: 1, Bebidas: 2, Postres: 3 };

function Cart() {
  const {
    cart,
    increaseQty,
    decreaseQty,
    removeFromCart,
    clearCart,
    total,
  } = useContext(CartContext);

  const [pago, setPago] = useState("efectivo");
  const [mesa, setMesa] = useState(null);

  const mesas = Array.from({ length: 10 }, (_, i) => i + 1);

  const productosOrdenados = [...cart].sort((a, b) => {
    const ca = ordenCategoria[a.categoria] ?? 9;
    const cb = ordenCategoria[b.categoria] ?? 9;
    if (ca !== cb) return ca - cb;
    return a.nombre.localeCompare(b.nombre, "es");
  });

  const realizarPedido = () => {
    if (!mesa) {
      Swal.fire({
        icon: "warning",
        title: "Selecciona una mesa",
        text: "Elige una de las mesas para realizar el pedido.",
      });
      return;
    }

    const resumen = productosOrdenados
      .map(
        (p) =>
          `${p.cantidad} x ${p.nombre}: $${(
            p.precio * p.cantidad
          ).toLocaleString("es-CO")}`
      )
      .join("<br/>");

    Swal.fire({
      icon: "success",
      title: "Pedido realizado",
      html: `
        <div style="text-align:left">
          <strong>Mesa: ${mesa}</strong><br/>
          ${resumen}
          <hr/>
          <strong>Total: $${total.toLocaleString("es-CO")}</strong><br/>
          <strong>Método de pago: ${
            pago === "transferencia" ? "Transferencia" : "Efectivo"
          }</strong>
        </div>
      `,
      confirmButtonText: "Aceptar",
    }).then((result) => {
      if (result.isConfirmed) clearCart();
    });
  };

  const confirmarVaciar = () => {
    Swal.fire({
      icon: "question",
      title: "¿Vaciar el carrito?",
      showCancelButton: true,
      confirmButtonText: "Sí, vaciar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) clearCart();
    });
  };

  return (
    <>
      <Navbar />

      <div className="cart-page">
        <h1>Carrito de Compras</h1>

        {cart.length === 0 ? (
          <p className="cart-empty">
            Tu carrito está vacío. ¡Explora nuestro menú y encuentra tu antojo!
          </p>
        ) : (
          <>
            {productosOrdenados.map((producto) => (
              <div key={producto.id} className="cart-item">
                <div className="cart-item-info">
                  <img src={producto.imagen} alt={producto.nombre} />
                  <div>
                    <h3>{producto.nombre}</h3>
                    <p>${producto.precio.toLocaleString("es-CO")} c/u</p>
                  </div>
                </div>

                <div className="cart-qty">
                  <button onClick={() => decreaseQty(producto.id)}>-</button>
                  <strong>{producto.cantidad}</strong>
                  <button onClick={() => increaseQty(producto.id)}>+</button>
                </div>

                <div style={{ textAlign: "right" }}>
                  <h3 style={{ margin: 0 }}>
                    ${(producto.precio * producto.cantidad).toLocaleString("es-CO")}
                  </h3>
                  <button
                    className="btn-danger"
                    onClick={() => removeFromCart(producto.id)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}

            <div className="cart-total">
              Total: <strong>${total.toLocaleString("es-CO")}</strong>
            </div>

            <div className="section-block">
              <h3>🪑 Elige tu mesa (1 - 10)</h3>
              <div className="table-grid">
                {mesas.map((numero) => (
                  <button
                    key={numero}
                    className={`table-btn ${mesa === numero ? "active" : ""}`}
                    onClick={() => setMesa(numero)}
                  >
                    Mesa {numero}
                  </button>
                ))}
              </div>
            </div>

            <div className="section-block">
              <h3>💳 Método de pago</h3>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    name="pago"
                    value="efectivo"
                    checked={pago === "efectivo"}
                    onChange={(e) => setPago(e.target.value)}
                  />{" "}
                  💵 Efectivo
                </label>
                <label>
                  <input
                    type="radio"
                    name="pago"
                    value="transferencia"
                    checked={pago === "transferencia"}
                    onChange={(e) => setPago(e.target.value)}
                  />{" "}
                  🏦 Transferencia
                </label>
              </div>
            </div>

            {pago === "transferencia" && (
              <div className="transfer-info">
                <strong>Datos para la transferencia:</strong>
                <p>
                  Banco: Cafetería Elyon · Cuenta: 1234 5678 9012 ·
                  Ahorros
                </p>
              </div>
            )}

            <div className="cart-actions">
              <button className="btn-primary" onClick={realizarPedido}>
                Realizar pedido
              </button>
              <button className="btn-outline" onClick={confirmarVaciar}>
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