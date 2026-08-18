import { Routes, Route } from "react-router-dom";

import Home from "./Pages/Home";
import Menu from "./Pages/Menu";
import Cart from "./Pages/Cart";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Admin from "./Pages/Admin";
import Pedidos from "./Pages/Pedidos";

function App() {
  return (
    <Routes>
      {/* PÁGINAS PRINCIPALES */}
      <Route path="/" element={<Home />} />
      <Route path="/menu" element={<Menu />} />
      <Route path="/carrito" element={<Cart />} />

      {/* AUTENTICACIÓN */}
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Register />} />

      {/* ADMINISTRACIÓN */}
      <Route path="/admin" element={<Admin />} />
      <Route path="/pedidos" element={<Pedidos />} />
    </Routes>
  );
}

export default App;