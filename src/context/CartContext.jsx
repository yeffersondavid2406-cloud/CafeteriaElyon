import { useEffect, useState } from "react";
import { CartContext } from "./cart-context";
import { crearPedido } from "../services/api";

const STORAGE_KEY = "elyon-cart";

// =====================================================
// CARGAR CARRITO DESDE LOCALSTORAGE
// =====================================================

function loadCart() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);

    return Array.isArray(parsed)
      ? parsed
      : [];
  } catch (error) {
    console.error(
      "❌ Error cargando el carrito:",
      error
    );

    return [];
  }
}

// =====================================================
// PROVIDER
// =====================================================

export function CartProvider({ children }) {
  const [cart, setCart] = useState(loadCart);
  const [creatingOrder, setCreatingOrder] =
    useState(false);

  // ===================================================
  // GUARDAR CARRITO
  // ===================================================

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(cart)
      );
    } catch (error) {
      console.error(
        "❌ Error guardando el carrito:",
        error
      );
    }
  }, [cart]);

  // ===================================================
  // AGREGAR PRODUCTO
  // ===================================================

  const addToCart = (producto) => {
    if (!producto || producto.id == null) {
      console.error(
        "❌ No se puede agregar un producto sin ID:",
        producto
      );

      return;
    }

    setCart((prevCart) => {
      const existente = prevCart.find(
        (item) =>
          String(item.id) === String(producto.id)
      );

      if (existente) {
        return prevCart.map((item) =>
          String(item.id) ===
          String(producto.id)
            ? {
                ...item,
                cantidad:
                  Number(item.cantidad || 0) + 1,
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

  // ===================================================
  // AUMENTAR CANTIDAD
  // ===================================================

  const increaseQty = (id) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        String(item.id) === String(id)
          ? {
              ...item,
              cantidad:
                Number(item.cantidad || 0) + 1,
            }
          : item
      )
    );
  };

  // ===================================================
  // DISMINUIR CANTIDAD
  // ===================================================

  const decreaseQty = (id) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          String(item.id) === String(id)
            ? {
                ...item,
                cantidad:
                  Number(item.cantidad || 0) - 1,
              }
            : item
        )
        .filter(
          (item) => Number(item.cantidad) > 0
        )
    );
  };

  // ===================================================
  // ELIMINAR PRODUCTO
  // ===================================================

  const removeFromCart = (id) => {
    setCart((prevCart) =>
      prevCart.filter(
        (item) =>
          String(item.id) !== String(id)
      )
    );
  };

  // ===================================================
  // VACIAR CARRITO
  // ===================================================

  const clearCart = () => {
    setCart([]);
  };

  // ===================================================
  // CANTIDAD TOTAL
  // ===================================================

  const cartCount = cart.reduce(
    (acc, item) =>
      acc + Number(item.cantidad || 0),
    0
  );

  // ===================================================
  // TOTAL
  // ===================================================

  const total = cart.reduce(
    (acc, item) =>
      acc +
      Number(item.precio || 0) *
        Number(item.cantidad || 0),
    0
  );

  // ===================================================
  // FINALIZAR PEDIDO
  // ===================================================

  const finalizarPedido = async ({
    mesa = null,
  } = {}) => {
    // -----------------------------------------------
    // VALIDAR CARRITO
    // -----------------------------------------------

    if (cart.length === 0) {
      throw new Error(
        "El carrito está vacío"
      );
    }

    // -----------------------------------------------
    // VALIDAR MESA
    // -----------------------------------------------

    if (!mesa) {
      throw new Error(
        "Debes seleccionar una mesa"
      );
    }

    // -----------------------------------------------
    // VALIDAR PRODUCTOS
    // -----------------------------------------------

    const productosInvalidos = cart.filter(
      (item) =>
        item.id == null ||
        Number(item.cantidad) <= 0
    );

    if (productosInvalidos.length > 0) {
      throw new Error(
        "Hay productos inválidos en el carrito"
      );
    }

    setCreatingOrder(true);

    try {
      // ---------------------------------------------
      // PREPARAR PEDIDO
      // ---------------------------------------------

      const pedido = {
        mesa,
        productos: cart.map((item) => ({
          producto_id: Number(item.id),
          cantidad: Number(item.cantidad),
        })),
      };

      console.log(
        "📦 Enviando pedido:",
        pedido
      );

      // ---------------------------------------------
      // ENVIAR AL BACKEND
      // ---------------------------------------------

      const resultado =
        await crearPedido(pedido);

      console.log(
        "✅ Pedido creado:",
        resultado
      );

      // ---------------------------------------------
      // LIMPIAR CARRITO
      // ---------------------------------------------

      clearCart();

      return resultado;
    } catch (error) {
      console.error(
        "❌ Error creando pedido:",
        error
      );

      throw error;
    } finally {
      setCreatingOrder(false);
    }
  };

  // ===================================================
  // CONTEXT
  // ===================================================

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
