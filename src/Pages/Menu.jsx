import { useEffect, useMemo, useState } from "react";

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
  const [error, setError] = useState("");

  // =====================================================
  // NORMALIZAR TEXTO
  // =====================================================

  const normalizar = (texto = "") =>
    String(texto)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

  // =====================================================
  // CARGAR PRODUCTOS
  // =====================================================

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await obtenerProductos();

        if (!Array.isArray(data)) {
          throw new Error("La API no devolvió una lista de productos");
        }

        // Productos disponibles desde PostgreSQL/Supabase
        const productosDisponibles = data
          .filter((producto) => producto.disponible !== false)
          .map((producto) => {
            // Si PostgreSQL ya tiene imagen, la usamos
            if (producto.imagen) {
              return producto;
            }

            // Si no tiene imagen, buscamos una imagen local
            const productoLocal = productosLocales.find(
              (local) =>
                normalizar(local.nombre) ===
                normalizar(producto.nombre)
            );

            return productoLocal
              ? {
                  ...producto,
                  imagen: productoLocal.imagen,
                }
              : producto;
          });

        setProducts(productosDisponibles);
      } catch (error) {
        console.error(
          "❌ Error cargando productos:",
          error
        );

        // Respaldo local para evitar que el menú quede vacío
        setProducts(productosLocales);

        setError(
          "No se pudieron cargar los productos desde el servidor. Mostrando catálogo local."
        );
      } finally {
        setLoading(false);
      }
    };

    cargarProductos();
  }, []);

  // =====================================================
  // CATEGORÍAS
  // =====================================================

  const categorias = useMemo(() => {
    const categoriasUnicas = [
      ...new Set(
        products
          .map((producto) => producto.categoria)
          .filter(Boolean)
      ),
    ];

    return ["Todos", ...categoriasUnicas];
  }, [products]);

  // =====================================================
  // FILTRAR PRODUCTOS
  // =====================================================

  const productosFiltrados = useMemo(() => {
    const textoBusqueda = normalizar(search);

    return products.filter((producto) => {
      const nombre = normalizar(producto.nombre);
      const descripcion = normalizar(producto.descripcion);
      const categoriaProducto = normalizar(
        producto.categoria
      );

      const coincideBusqueda =
        nombre.includes(textoBusqueda) ||
        descripcion.includes(textoBusqueda);

      const coincideCategoria =
        categoria === "Todos" ||
        categoriaProducto === normalizar(categoria);

      return coincideBusqueda && coincideCategoria;
    });
  }, [products, search, categoria]);

  // =====================================================
  // CONTADORES
  // =====================================================

  const productosDestacados = useMemo(() => {
    return products.filter(
      (producto) => producto.destacado === true
    ).length;
  }, [products]);

  // =====================================================
  // CAMBIAR CATEGORÍA
  // =====================================================

  const cambiarCategoria = (nuevaCategoria) => {
    setCategoria(nuevaCategoria);
  };

  // =====================================================
  // LIMPIAR FILTROS
  // =====================================================

  const limpiarFiltros = () => {
    setSearch("");
    setCategoria("Todos");
  };

  // =====================================================
  // INTERFAZ
  // =====================================================

  return (
    <>
      <Navbar />

      <main className="menu-container">

        {/* =================================================
            ENCABEZADO
        ================================================= */}

        <section className="menu-header">
          <h1>Nuestro Menú</h1>

          <p className="menu-lead">
            Sabores preparados con cariño para tu pausa perfecta ☕
          </p>
        </section>

        {/* =================================================
            RESUMEN
        ================================================= */}

        {!loading && (
          <section className="menu-resumen">
            <div className="menu-resumen-item">
              <strong>{products.length}</strong>
              <span>Productos</span>
            </div>

            <div className="menu-resumen-item">
              <strong>{categorias.length - 1}</strong>
              <span>Categorías</span>
            </div>

            <div className="menu-resumen-item">
              <strong>{productosDestacados}</strong>
              <span>Destacados</span>
            </div>
          </section>
        )}

        {/* =================================================
            FILTROS
        ================================================= */}

        <section className="menu-filtros">

          <SearchBar
            search={search}
            setSearch={setSearch}
          />

          <CategoryFilter
            categoria={categoria}
            setCategoria={cambiarCategoria}
            categorias={categorias}
          />

        </section>

        {/* =================================================
            AVISO DE ERROR / RESPALDO
        ================================================= */}

        {error && (
          <div className="mensaje-productos">
            ⚠️ {error}
          </div>
        )}

        {/* =================================================
            CARGANDO
        ================================================= */}

        {loading ? (
          <div className="mensaje-productos">
            <p>Cargando productos...</p>
          </div>
        ) : (

          <>

            {/* =================================================
                RESULTADOS
            ================================================= */}

            <div className="menu-resultados">

              <p>
                Mostrando{" "}
                <strong>
                  {productosFiltrados.length}
                </strong>{" "}
                {productosFiltrados.length === 1
                  ? "producto"
                  : "productos"}
              </p>

            </div>

            {/* =================================================
                PRODUCTOS
            ================================================= */}

            {productosFiltrados.length > 0 ? (

              <div className="productos">

                {productosFiltrados.map((producto) => (
                  <ProductCard
                    key={producto.id}
                    producto={producto}
                  />
                ))}

              </div>

            ) : (

              <div className="sin-productos">

                <div className="sin-productos-icono">
                  🔎
                </div>

                <h2>
                  No encontramos productos
                </h2>

                <p>
                  No hay productos que coincidan con
                  tu búsqueda o categoría.
                </p>

                <button
                  type="button"
                  className="btn-primary"
                  onClick={limpiarFiltros}
                >
                  Limpiar filtros
                </button>

              </div>

            )}

          </>
        )}

      </main>
    </>
  );
}

export default Menu;

