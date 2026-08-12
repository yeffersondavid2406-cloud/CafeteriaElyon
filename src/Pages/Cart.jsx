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

  return (
    <>
      <Navbar />

      <div style={{ padding: "30px" }}>
        <h1>Carrito de Compras</h1>

        {cart.length === 0 ? (
          <p>Tu carrito está vacío.</p>
        ) : (
          <>
            {productosOrdenados.map((producto) => (
              <div
                key={producto.id}
                style={{
                  border: "1px solid #ccc",
                  padding: "15px",
                  marginBottom: "10px",
                  borderRadius: "8px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "15px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                  <img
                    src={producto.imagen}
                    alt={producto.nombre}
                    style={{
                      width: "90px",
                      height: "90px",
                      objectFit: "contain",
                      objectPosition: "center",
                      background: "var(--gris-suave)",
                      borderRadius: "8px",
                      padding: "6px",
                    }}
                  />
                  <div>
                    <h3 style={{ margin: 0 }}>{producto.nombre}</h3>
                    <p style={{ margin: "5px 0 0", color: "#555" }}>
                      ${producto.precio.toLocaleString("es-CO")} c/u
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <button onClick={() => decreaseQty(producto.id)}>-</button>
                  <strong>{producto.cantidad}</strong>
                  <button onClick={() => increaseQty(producto.id)}>+</button>
                </div>

                <div style={{ textAlign: "right" }}>
                  <h4 style={{ margin: 0 }}>
                    ${(producto.precio * producto.cantidad).toLocaleString("es-CO")}
                  </h4>
                  <button
                    onClick={() => removeFromCart(producto.id)}
                    style={{
                      marginTop: "8px",
                      background: "crimson",
                      color: "white",
                      border: "none",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      cursor: "pointer",
                    }}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}

            <hr />

            <h2>Total: ${total.toLocaleString("es-CO")}</h2>

            <div style={{ margin: "20px 0" }}>
              <h3>Elige tu mesa (1 - 10)</h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(5, 80px)",
                  gap: "10px",
                  justifyContent: "start",
                }}
              >
                {mesas.map((numero) => (
                  <button
                    key={numero}
                    onClick={() => setMesa(numero)}
                    style={{
                      padding: "14px 0",
                      borderRadius: "8px",
                      border: mesa === numero ? "3px solid #2563eb" : "1px solid #cbd5e1",
                      background: mesa === numero ? "#dbeafe" : "white",
                      color: mesa === numero ? "#1e3a8a" : "#374151",
                      fontSize: "16px",
                      fontWeight: "600",
                      cursor: "pointer",
                    }}
                  >
                    🪑 Mesa {numero}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ margin: "20px 0" }}>
              <h3>Método de pago</h3>
              <label style={{ marginRight: "20px", cursor: "pointer" }}>
                <input
                  type="radio"
                  name="pago"
                  value="efectivo"
                  checked={pago === "efectivo"}
                  onChange={(e) => setPago(e.target.value)}
                />{" "}
                💵 Efectivo
              </label>
              <label style={{ cursor: "pointer" }}>
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

            {pago === "transferencia" && (
              <div
                style={{
                  background: "#f8f5f0",
                  padding: "15px",
                  borderRadius: "8px",
                  marginBottom: "20px",
                }}
              >
                <strong>Datos para la transferencia:</strong>
                <p style={{ margin: "5px 0 0" }}>
                  Banco: Cafetería Elyon · Cuenta: 1234 5678 9012 ·
                  Ahorros
                </p>
              </div>
            )}

            <button
              onClick={realizarPedido}
              style={{
                background: "#6F4E37",
                color: "white",
                border: "none",
                padding: "12px 30px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "16px",
                marginRight: "10px",
              }}
            >
              Realizar pedido
            </button>

            <button onClick={clearCart}>
              Vaciar carrito
            </button>
          </>
        )}
      </div>
    </>
  );
}

export default Cart;