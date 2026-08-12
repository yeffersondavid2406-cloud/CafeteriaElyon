function CategoryFilter({ categoria, setCategoria }) {
  return (
    <div className="category-filter">
      <button onClick={() => setCategoria("Todos")}>
        Todos
      </button>

      <button onClick={() => setCategoria("Comida")}>
        🍔 Comida
      </button>

      <button onClick={() => setCategoria("Bebidas")}>
        ☕ Bebidas
      </button>

      <button onClick={() => setCategoria("Postres")}>
        🍰 Postres
      </button>
    </div>
  );
}

export default CategoryFilter;