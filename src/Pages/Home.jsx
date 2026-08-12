import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import FeaturedProducts from "../components/FeaturedProducts";
import Footer from "../components/Footer";

function Home() {
  return (
    <>
      <Navbar />

      <Hero />

      <FeaturedProducts />

      <section className="home-info">
        <h2 className="section-title">¿Por qué elegirnos?</h2>
        <p className="section-subtitle">
          Todo lo que necesitas para tu jornada en un solo lugar
        </p>

        <div className="info-cards">
          <div className="info-card">
            <div className="icono">🍔</div>
            <h3>Variedad de productos</h3>
            <p>
              Comidas, bebidas y snacks frescos preparados para toda la
              comunidad educativa.
            </p>
          </div>

          <div className="info-card">
            <div className="icono">💲</div>
            <h3>Precios justos</h3>
            <p>
              Ofrecemos precios accesibles para que todos puedan disfrutar
              de una buena atención.
            </p>
          </div>

          <div className="info-card">
            <div className="icono">⚡</div>
            <h3>Atención rápida</h3>
            <p>
              Un servicio ágil y amable para que no pierdas tiempo en tus
              descansos.
            </p>
          </div>
        </div>
      </section>

      <section className="cta-banner">
        <h2>¡Ven y prueba nuestro menú!</h2>
        <p>Mira todos los productos disponibles y arma tu pedido.</p>
        <Link to="/menu">
          <button className="btn-secondary">Ver Menú</button>
        </Link>
      </section>

      <Footer />
    </>
  );
}

export default Home;