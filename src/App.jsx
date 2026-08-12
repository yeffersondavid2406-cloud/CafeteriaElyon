import { Routes, Route } from "react-router-dom";

import Home from "./Pages/Home";
import Menu from "./Pages/Menu";
import Cart from "./Pages/Cart";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Admin from "./Pages/Admin";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/menu" element={<Menu />} />
      <Route path="/carrito" element={<Cart />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Register />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  );
}

export default App;