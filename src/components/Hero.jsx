import React, { useState } from 'react';
import CatalogModal from './CatalogModal';
import './Hero.css';

const Hero = () => {
  const [showCatalog, setShowCatalog] = useState(false);

  return (
    <section className="hero">
      <div className="container hero-container">
        <div className="hero-content">
          <h1 className="hero-title">
            Premium Supplies.<br />
            <span className="text-highlight">For Home & Business.</span>
          </h1>
          <p className="hero-subtitle">
            CleanCare delivers unparalleled commercial-grade cleaning supplies direct to your door. Whether you're stocking a massive enterprise facility or securing high-end products for your home, we have you covered.
          </p>
          <div className="hero-cta">
            <button onClick={() => setShowCatalog(true)} className="btn btn-primary btn-large">Shop Full Catalog</button>
          </div>

          <div className="hero-trust">
            <span>✓ Fast Nationwide Shipping</span>
            <span>✓ Dedicated Account Managers</span>
            <span>✓ Net-30 Terms Available</span>
          </div>
        </div>
        
        <div className="hero-image-wrapper">
           <img src="/hero-banner.png" alt="Premium Cleaning Supplies" className="hero-image" />
        </div>
      </div>

      {showCatalog && <CatalogModal onClose={() => setShowCatalog(false)} />}
    </section>
  );
};

export default Hero;
