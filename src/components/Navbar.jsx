import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import { CartContext } from "../context/cart-context";
import { AuthContext } from "../context/auth-context";

function Navbar() {
  const { cartCount } = useContext(CartContext);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    const result = await Swal.fire({
      icon: "question",
      title: "¿Cerrar sesión?",
      showCancelButton: true,
      confirmButtonText: "Sí, salir",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      await logout();
      navigate("/");
    }
  };

  const esAdmin = user?.rol === "admin";

  return (
    <nav className="navbar">
      <h2>Cafetería Elyon ☕</h2>

      <ul>
        {esAdmin ? (
          <>
            <li><Link to="/admin">Dashboard</Link></li>
            <li><Link to="/admin/pedidos">Pedidos</Link></li>
            <li><Link to="/admin/productos">Productos</Link></li>
            <li><Link to="/admin/clientes">Clientes</Link></li>
            <li>
              <button type="button" className="nav-link-btn" onClick={handleLogout}>
                Cerrar sesión
              </button>
            </li>
          </>
        ) : (
          <>
            <li><Link to="/">Inicio</Link></li>
            <li><Link to="/menu">Menú</Link></li>

            {user ? (
              <>
                <li><Link to="/perfil">Mis pedidos</Link></li>
                <li><Link to="/perfil">Mi perfil</Link></li>
                <li>
                  <button type="button" className="nav-link-btn" onClick={handleLogout}>
                    Cerrar sesión
                  </button>
                </li>
              </>
            ) : (
              <>
                <li><Link to="/login">Iniciar sesión</Link></li>
                <li><Link to="/registro">Registrarse</Link></li>
              </>
            )}
          </>
        )}

        <li>
          <Link to="/carrito" className="cart-link">
            Carrito
            {cartCount > 0 && (
              <span className="cart-count">{cartCount}</span>
            )}
          </Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;