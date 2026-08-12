import ProductCard from "./ProductCard";
import products from "../data/products";

function FeaturedProducts() {
  const destacados = products.filter(
    (producto) => producto.destacado
  );

  return (
    <section className="featured" id="destacados">
      <h2>Nuestros Favoritos</h2>

      <div className="productos">
        {destacados.map((producto) => (
          <ProductCard
            key={producto.id}
            producto={producto}
          />
        ))}
      </div>
    </section>
  );
}

export default FeaturedProducts;