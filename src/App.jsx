import { Routes, Route, Navigate } from "react-router-dom";

import Home from "./Pages/Home";
import Menu from "./Pages/Menu";
import Cart from "./Pages/Cart";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Admin from "./Pages/Admin";
import AdminProductos from "./Pages/AdminProductos";
import AdminClientes from "./Pages/AdminClientes";
import Pedidos from "./Pages/pedidos";
import Perfil from "./Pages/Perfil";

import { RequireAuth, RequireAdmin } from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* PÁGINAS PÚBLICAS */}
      <Route path="/" element={<Home />} />
      <Route path="/menu" element={<Menu />} />
      <Route path="/carrito" element={<Cart />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Register />} />

      {/* CLIENTE */}
      <Route
        path="/perfil"
        element={
          <RequireAuth>
            <Perfil />
          </RequireAuth>
        }
      />

      {/* ADMINISTRACIÓN */}
      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <Admin />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/pedidos"
        element={
          <RequireAdmin>
            <Pedidos />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/productos"
        element={
          <RequireAdmin>
            <AdminProductos />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/clientes"
        element={
          <RequireAdmin>
            <AdminClientes />
          </RequireAdmin>
        }
      />

      {/* Compatibilidad: la ruta anterior de pedidos redirige al panel admin */}
      <Route path="/pedidos" element={<Navigate to="/admin/pedidos" replace />} />
    </Routes>
  );
}

export default App;