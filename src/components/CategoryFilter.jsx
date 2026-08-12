const categorias = [
  { valor: "Todos", etiqueta: "Todos" },
  { valor: "Comida", etiqueta: "🍔 Comida" },
  { valor: "Bebidas", etiqueta: "☕ Bebidas" },
  { valor: "Postres", etiqueta: "🍰 Postres" },
];

function CategoryFilter({ categoria, setCategoria }) {
  return (
    <div className="category-filter">
      {categorias.map(({ valor, etiqueta }) => (
        <button
          key={valor}
          className={categoria === valor ? "active" : ""}
          onClick={() => setCategoria(valor)}
        >
          {etiqueta}
        </button>
      ))}
    </div>
  );
}

export default CategoryFilter;