import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import SearchBar from "../components/SearchBar";
import CategoryFilter from "../components/CategoryFilter";

import productosLocales from "../data/products.js";
import { obtenerProductos } from "../services/api";

function Menu() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [categoria, setCategoria] = useState("Todos");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        setLoading(true);

        const data = await obtenerProductos();

        // Supabase tiene productos
        if (Array.isArray(data) && data.length > 0) {
          const disponibles = data
            .filter((producto) => producto.disponible !== false)
            .map((producto) => {
              if (producto.imagen) return producto;

              const local = productosLocales.find(
                (p) =>
                  p.nombre.toLowerCase() ===
                  producto.nombre.toLowerCase()
              );

              return local
                ? { ...producto, imagen: local.imagen }
                : producto;
            });

          setProducts(disponibles);
        } else {
          // Supabase está vacío → usamos los productos locales
          setProducts(productosLocales);
        }
      } catch (error) {
        console.error("❌ Error cargando productos desde la API:", error);

        // Si la API falla → usamos los productos locales
        setProducts(productosLocales);
      } finally {
        setLoading(false);
      }
    };

    cargarProductos();
  }, []);

  const normalizar = (texto = "") =>
    texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const categorias = [
    "Todos",
    ...new Set(
      products
        .map((producto) => producto.categoria)
        .filter(Boolean)
    ),
  ];

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

        <p className="menu-lead">
          Sabores preparados con cariño para tu pausa perfecta
        </p>

        <SearchBar
          search={search}
          setSearch={setSearch}
        />

        <CategoryFilter
          categoria={categoria}
          setCategoria={setCategoria}
          categorias={categorias}
        />

        {loading ? (
          <p className="mensaje-productos">
            Cargando productos...
          </p>
        ) : (
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
        )}
      </div>
    </>
  );
}

export default Menu;