const API_URL = "http://localhost:3000/api";

export async function obtenerProductos() {
  const response = await fetch(`${API_URL}/productos`);

  if (!response.ok) {
    throw new Error("No se pudieron obtener los productos");
  }

  const data = await response.json();

  return data.productos;
}

export async function crearPedido(pedido) {
  const response = await fetch(`${API_URL}/pedidos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(pedido),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo crear el pedido");
  }

  return data;
}