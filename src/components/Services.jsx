import React from 'react';
import './Services.css';

const servicesSet = [
  {
    id: 1,
    title: 'Residential Deep Clean',
    description: 'A comprehensive, top-to-bottom clean that leaves your home spotless, sanitized, and refreshed.',
    icon: '✨'
  },
  {
    id: 2,
    title: 'Commercial Maintenance',
    description: 'Tailored cleaning schedules to ensure your workplace remains professional, healthy, and welcoming at all times.',
    icon: '🏢'
  },
  {
    id: 3,
    title: 'Move-In / Move-Out',
    description: 'Ensure a seamless transition with our meticulous cleaning service designed for empty properties.',
    icon: '🔑'
  },
  {
    id: 4,
    title: 'Specialized Care',
    description: 'From carpet extraction to window washing, we handle specialized tasks with professional-grade equipment.',
    icon: '🛠️'
  }
];

const Services = () => {
  return (
    <section id="services" className="services section-padding">
      <div className="container">
        <div className="text-center">
          <h2 className="section-title">Our Premium Services</h2>
          <p className="section-subtitle">
            We provide a diverse range of cleaning and maintenance solutions, each delivered with our signature standard of excellence.
          </p>
        </div>

        <div className="services-grid">
          {servicesSet.map(service => (
            <div key={service.id} className="service-card">
              <div className="service-icon">{service.icon}</div>
              <h3 className="service-title">{service.title}</h3>
              <p className="service-desc">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
