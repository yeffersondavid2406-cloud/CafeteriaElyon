import { useContext } from "react";
import { Link } from "react-router-dom";

import { CartContext } from "../context/cart-context";
import { AuthContext } from "../context/auth-context";

function Navbar() {
  const { cartCount } = useContext(CartContext);
  const { admin, logout } = useContext(AuthContext);

  return (
    <nav className="navbar">
      <h2>Cafetería Elyon ☕</h2>

      <ul>
        <li><Link to="/">Inicio</Link></li>
        <li><Link to="/menu">Menú</Link></li>
        <li>
          <Link to="/carrito" className="cart-link">
            Carrito
            {cartCount > 0 && (
              <span className="cart-count">{cartCount}</span>
            )}
          </Link>
        </li>

        {admin && (
          <>
            <li><Link to="/admin">Panel Admin</Link></li>
            <li>
              <Link to="/login" onClick={() => logout()}>
                Cerrar sesión
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;