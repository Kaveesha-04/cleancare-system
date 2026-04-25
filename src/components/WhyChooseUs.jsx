import React from 'react';
import './WhyChooseUs.css';

const WhyChooseUs = () => {
  return (
    <section id="about" className="why-choose-us section-padding">
      <div className="container">
        <div className="wcu-content">
          <div className="wcu-text">
            <h2 className="section-title">The CleanCare Difference</h2>
            <p className="wcu-description">
              We aren't just another retail store. We are your supply chain partners, offering the highest quality industrial-grade cleaning products at wholesale prices directly to professionals and homeowners.
            </p>
            
            <ul className="wcu-list">
              <li>
                <strong>✓ Guaranteed Inventory</strong>
                <span>We maintain massive stock levels to ensure you never run out of critical supplies.</span>
              </li>
              <li>
                <strong>✓ Eco-Friendly Options</strong>
                <span>Protecting your family, pets, and the planet with safe, green cleaning solutions.</span>
              </li>
              <li>
                <strong>✓ Professional Grade</strong>
                <span>Our catalog is rigorously tested and trusted by commercial janitorial services worldwide.</span>
              </li>
            </ul>

            <a href="#contact" className="btn btn-primary mt-2">Speak to an Expert</a>
          </div>
          <div className="wcu-image">
            <div className="wcu-image-inner">
              {/* Using a solid accent as a placeholder or a secondary generated image could go here */}
              <div className="wcu-placeholder-gradient"></div>
              <div className="wcu-experience-badge">
                <span className="badge-number">10+</span>
                <span className="badge-text">Years<br/>Excellence</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
