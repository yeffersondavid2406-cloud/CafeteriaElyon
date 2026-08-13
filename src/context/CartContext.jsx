import { useEffect, useState } from "react";
import { CartContext } from "./cart-context";
import { crearPedido } from "../services/api";

const STORAGE_KEY = "elyon-cart";

function loadCart() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error cargando el carrito:", error);
    return [];
  }
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(loadCart);
  const [creatingOrder, setCreatingOrder] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  const addToCart = (producto) => {
    setCart((prevCart) => {
      const existente = prevCart.find(
        (item) => item.id === producto.id
      );

      if (existente) {
        return prevCart.map((item) =>
          item.id === producto.id
            ? {
                ...item,
                cantidad: Number(item.cantidad) + 1,
              }
            : item
        );
      }

      return [
        ...prevCart,
        {
          ...producto,
          cantidad: 1,
        },
      ];
    });
  };

  const increaseQty = (id) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id
          ? {
              ...item,
              cantidad: Number(item.cantidad) + 1,
            }
          : item
      )
    );
  };

  const decreaseQty = (id) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.id === id
            ? {
                ...item,
                cantidad: Number(item.cantidad) - 1,
              }
            : item
        )
        .filter((item) => item.cantidad > 0)
    );
  };

  const removeFromCart = (id) => {
    setCart((prevCart) =>
      prevCart.filter((item) => item.id !== id)
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce(
    (acc, item) => acc + Number(item.cantidad),
    0
  );

  const total = cart.reduce(
    (acc, item) =>
      acc + Number(item.precio) * Number(item.cantidad),
    0
  );

  const finalizarPedido = async ({
    cliente_id = null,
    mesa = null,
  } = {}) => {
    if (cart.length === 0) {
      throw new Error("El carrito está vacío");
    }

    if (!mesa) {
      throw new Error("Debes seleccionar una mesa");
    }

    setCreatingOrder(true);

    try {
      const pedido = {
        cliente_id,
        mesa,
        productos: cart.map((item) => ({
          producto_id: item.id,
          cantidad: Number(item.cantidad),
        })),
      };

      console.log("📦 Enviando pedido:", pedido);

      const resultado = await crearPedido(pedido);

      console.log("✅ Pedido creado:", resultado);

      clearCart();

      return resultado;
    } catch (error) {
      console.error("❌ Error creando pedido:", error);
      throw error;
    } finally {
      setCreatingOrder(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        increaseQty,
        decreaseQty,
        removeFromCart,
        clearCart,
        cartCount,
        total,
        finalizarPedido,
        creatingOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}