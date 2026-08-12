import { Link } from "react-router-dom";
import banner from "../assets/images/banner.jpg";

function Hero() {
  return (
    <section
      className="hero-banner"
      style={{
        backgroundImage: `linear-gradient(rgba(62,43,30,.62), rgba(107,68,35,.5)), url(${banner})`,
      }}
    >
      <div className="hero-content">
        <h1>☕ Cafetería Elyon</h1>

        <p>
          Disfruta de comidas, bebidas y snacks preparados para toda la
          comunidad educativa.
        </p>

        <div className="hero-buttons">
          <Link to="/menu">
            <button className="btn-primary">
              Ver Menú
            </button>
          </Link>

          <a href="#destacados">
            <button className="btn-secondary">
              Productos destacados
            </button>
          </a>
        </div>
      </div>
    </section>
  );
}

export default Hero;