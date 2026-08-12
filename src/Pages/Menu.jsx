import { useState } from "react";

import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import SearchBar from "../components/SearchBar";
import CategoryFilter from "../components/CategoryFilter";

import products from "../data/products";

function Menu() {
  const [search, setSearch] = useState("");
  const [categoria, setCategoria] = useState("Todos");

  const normalizar = (texto) =>
    texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const productosFiltrados = products.filter((producto) => {
    const coincideNombre = normalizar(producto.nombre).includes(
      normalizar(search)
    );

    const coincideCategoria =
      categoria === "Todos" ||
      producto.categoria === categoria;

    return coincideNombre && coincideCategoria;
  });

  return (
    <>
      <Navbar />

      <div className="menu-container">
        <h1>Nuestro Menú</h1>

        <SearchBar
          search={search}
          setSearch={setSearch}
        />

        <CategoryFilter
          categoria={categoria}
          setCategoria={setCategoria}
        />

        <div className="productos">
          {productosFiltrados.length > 0 ? (
            productosFiltrados.map((producto) => (
              <ProductCard
                key={producto.id}
                producto={producto}
              />
            ))
          ) : (
            <p>No se encontraron productos.</p>
          )}
        </div>
      </div>
    </>
  );
}

export default Menu;