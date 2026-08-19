const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000/api";

const TOKEN_KEY = "elyon_token";

// =====================================================
// GESTIÓN DEL TOKEN (nunca se guardan contraseñas)
// =====================================================

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

function headers(conJSON = true) {
  const h = {};

  if (conJSON) {
    h["Content-Type"] = "application/json";
  }

  const token = getToken();

  if (token) {
    h.Authorization = `Bearer ${token}`;
  }

  return h;
}

async function parseResponse(response) {
  let data;

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    if (response.status === 401) {
      clearToken();
    }

    throw new Error(data.message || "Error en la solicitud");
  }

  return data;
}

// =====================================================
// AUTH
// =====================================================

export async function registerUser({ nombre, nombre_usuario, email, password }) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ nombre, nombre_usuario, email, password }),
  });

  return parseResponse(response);
}

export async function loginUser({ identificador, password }) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ identificador, password }),
  });

  return parseResponse(response);
}

export async function logout() {
  const response = await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    headers: headers(),
  });

  return parseResponse(response);
}

export async function obtenerUsuarioActual() {
  const response = await fetch(`${API_URL}/auth/me`, {
    headers: headers(),
  });

  return parseResponse(response);
}

export async function actualizarPerfil(datos) {
  const response = await fetch(`${API_URL}/auth/me`, {
    method: "PATCH",
    headers: headers(),
    body: JSON.stringify(datos),
  });

  return parseResponse(response);
}

// =====================================================
// PRODUCTOS
// =====================================================

export async function obtenerProductos() {
  const response = await fetch(`${API_URL}/productos`);

  if (!response.ok) {
    throw new Error("No se pudieron obtener los productos");
  }

  const data = await response.json();

  return data.productos;
}

export async function crearProducto(producto) {
  const response = await fetch(`${API_URL}/productos`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(producto),
  });

  return parseResponse(response);
}

export async function actualizarProducto(id, producto) {
  const response = await fetch(`${API_URL}/productos/${id}`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify(producto),
  });

  return parseResponse(response);
}

export async function eliminarProducto(id) {
  const response = await fetch(`${API_URL}/productos/${id}`, {
    method: "DELETE",
    headers: headers(),
  });

  return parseResponse(response);
}

// =====================================================
// PEDIDOS
// =====================================================

export async function crearPedido(pedido) {
  const response = await fetch(`${API_URL}/pedidos`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(pedido),
  });

  return parseResponse(response);
}

export async function obtenerPedidos() {
  const response = await fetch(`${API_URL}/pedidos`, {
    headers: headers(),
  });

  return parseResponse(response);
}

export async function obtenerMisPedidos() {
  const response = await fetch(`${API_URL}/pedidos/mis-pedidos`, {
    headers: headers(),
  });

  const data = await parseResponse(response);

  return data.pedidos || [];
}

export async function actualizarEstadoPedido(pedidoId, estado) {
  const response = await fetch(`${API_URL}/pedidos/${pedidoId}/estado`, {
    method: "PATCH",
    headers: headers(),
    body: JSON.stringify({ estado }),
  });

  return parseResponse(response);
}

// =====================================================
// PAGOS
// =====================================================

export async function crearPago(pago) {
  const response = await fetch(`${API_URL}/pagos`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(pago),
  });

  return parseResponse(response);
}

export async function actualizarEstadoPago(pagoId, estado) {
  const response = await fetch(`${API_URL}/pagos/${pagoId}/estado`, {
    method: "PATCH",
    headers: headers(),
    body: JSON.stringify({ estado }),
  });

  return parseResponse(response);
}

// =====================================================
// ADMIN
// =====================================================

export async function obtenerDashboard() {
  const response = await fetch(`${API_URL}/admin/dashboard`, {
    headers: headers(),
  });

  const data = await parseResponse(response);

  return data.dashboard;
}

export async function obtenerClientes() {
  const response = await fetch(`${API_URL}/admin/clientes`, {
    headers: headers(),
  });

  const data = await parseResponse(response);

  return data.clientes || [];
}