import { useContext } from "react";
import Swal from "sweetalert2";
import { CartContext } from "../context/cart-context";

function ProductCard({ producto }) {
  const { addToCart } = useContext(CartContext);

  const handleAdd = () => {
    addToCart(producto);

    Swal.fire({
      icon: "success",
      title: "Producto agregado",
      text: `${producto.nombre} se agregó al carrito`,
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const precio = Number(producto.precio);

  return (
    <div className="card">
      <img
        src={producto.imagen || "/placeholder-producto.jpg"}
        alt={producto.nombre}
        className="product-image"
      />

      <h3>{producto.nombre}</h3>

      <p>{producto.descripcion}</p>

      <h4>${precio.toLocaleString("es-CO")}</h4>

      <button onClick={handleAdd}>
        Agregar al carrito
      </button>
    </div>
  );
}

export default ProductCard;