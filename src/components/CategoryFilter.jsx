const iconosCategorias = {
  Comida: "🍔",
  Bebidas: "☕",
  Postres: "🍰",
  Desayunos: "🍳",
  Snacks: "🍟",
  Cafés: "☕",
};

function CategoryFilter({
  categoria,
  setCategoria,
  categorias = [],
}) {
  const categoriasUnicas = [
    "Todos",
    ...new Set(categorias.filter(Boolean)),
  ];

  return (
    <div className="category-filter">
      {categoriasUnicas.map((nombreCategoria) => {
        const icono = iconosCategorias[nombreCategoria] || "📦";

        const etiqueta =
          nombreCategoria === "Todos"
            ? "Todos"
            : `${icono} ${nombreCategoria}`;

        return (
          <button
            key={nombreCategoria}
            className={categoria === nombreCategoria ? "active" : ""}
            onClick={() => setCategoria(nombreCategoria)}
          >
            {etiqueta}
          </button>
        );
      })}
    </div>
  );
}

export default CategoryFilter;