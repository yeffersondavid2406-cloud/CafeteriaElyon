import { useContext } from "react";
import Swal from "sweetalert2";
import { CartContext } from "../context/cart-context";

function ProductCard({ producto }) {
  const { addToCart } = useContext(CartContext);

  const handleAdd = () => {
    if (!producto || !producto.id) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo identificar el producto.",
      });

      return;
    }

    if (producto.disponible === false) {
      Swal.fire({
        icon: "warning",
        title: "Producto no disponible",
        text: `${producto.nombre} no está disponible en este momento.`,
      });

      return;
    }

    addToCart(producto);

    Swal.fire({
      icon: "success",
      title: "Producto agregado",
      text: `${producto.nombre} se agregó al carrito`,
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const precio = Number(producto?.precio || 0);

  return (
    <article className="card">

      <div className="product-image-container">
        <img
          src={
            producto?.imagen ||
            "/placeholder-producto.jpg"
          }
          alt={producto?.nombre || "Producto"}
          className="product-image"
          loading="lazy"
        />
      </div>

      <div className="product-content">

        <h3>
          {producto?.nombre || "Producto sin nombre"}
        </h3>

        {producto?.categoria && (
          <span className="product-category">
            {producto.categoria}
          </span>
        )}

        {producto?.descripcion && (
          <p>
            {producto.descripcion}
          </p>
        )}

        <div className="product-footer">

          <h4>
            $
            {precio.toLocaleString("es-CO")}
          </h4>

          <button
            type="button"
            onClick={handleAdd}
            disabled={producto?.disponible === false}
          >
            {producto?.disponible === false
              ? "No disponible"
              : "Agregar al carrito"}
          </button>

        </div>

      </div>

    </article>
  );
}

export default ProductCard;

