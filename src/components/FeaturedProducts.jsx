import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";

import productosLocales from "../data/products.js";
import { obtenerProductos } from "../services/api";

function FeaturedProducts() {
  const [destacados, setDestacados] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarDestacados = async () => {
      try {
        const data = await obtenerProductos();

        if (Array.isArray(data) && data.length > 0) {
          setDestacados(
            data
              .filter(
                (producto) =>
                  producto.destacado === true &&
                  producto.disponible !== false
              )
              .map((producto) => {
                if (producto.imagen) return producto;

                const local = productosLocales.find(
                  (p) =>
                    p.nombre.toLowerCase() ===
                    producto.nombre.toLowerCase()
                );

                if (
                  local &&
                  (local.imagen || local.destacado)
                ) {
                  return { ...producto, imagen: local.imagen };
                }

                return producto;
              })
          );
        } else {
          setDestacados(
            productosLocales.filter(
              (producto) => producto.destacado
            )
          );
        }
      } catch (error) {
        console.error(
          "❌ Error cargando destacados:",
          error
        );

        setDestacados(
          productosLocales.filter(
            (producto) => producto.destacado
          )
        );
      } finally {
        setLoading(false);
      }
    };

    cargarDestacados();
  }, []);

  return (
    <section className="featured" id="destacados">
      <h2>Nuestros Favoritos</h2>

      {loading ? (
        <p className="mensaje-productos">
          Cargando productos...
        </p>
      ) : destacados.length > 0 ? (
        <div className="productos">
          {destacados.map((producto) => (
            <ProductCard
              key={producto.id}
              producto={producto}
            />
          ))}
        </div>
      ) : (
        <p className="mensaje-productos">
          No hay productos destacados.
        </p>
      )}
    </section>
  );
}

export default FeaturedProducts;