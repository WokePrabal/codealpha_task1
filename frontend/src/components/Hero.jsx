// frontend/src/components/Hero.jsx
export default function Hero(){
  return (
    <section className="hero">
      <div className="hero__bg" />                     {/* background image handled by CSS */}
      <div className="hero__content container">
        <h1>Discover essentials — delivered fast</h1>
        <p>Curated picks across fashion, tech & home. Free shipping on orders ₹999+.</p>
        <div className="hero__ctas">
          <a href="#catalog" className="btn-primary">Shop Now</a>
          <a href="#catalog" className="btn-outline">Explore Collection</a>
        </div>
      </div>
    </section>
  );
}
