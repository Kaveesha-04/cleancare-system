import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer" id="contact">
      <div className="container footer-grid">
        <div className="footer-brand">
          <a href="/" className="logo footer-logo">
            CleanCare<span>Supply</span>
          </a>
          <p className="footer-bio">
            Premium cleaning supplies and machinery for residential and commercial environments. Experience the standard of excellence.
          </p>
        </div>
        
        <div className="footer-links">
          <h4>Departments</h4>
          <ul>
            <li><a href="#products">Chemicals & Detergents</a></li>
            <li><a href="#products">Tools & Equipment</a></li>
            <li><a href="#products">Machinery</a></li>
            <li><a href="#products">New Arrivals</a></li>
          </ul>
        </div>

        <div className="footer-links">
          <h4>Company</h4>
          <ul>
            <li><a href="#about">About Us</a></li>
            <li><a href="#">Careers</a></li>
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Terms of Service</a></li>
          </ul>
        </div>

        <div className="footer-contact">
          <h4>Support & Sales</h4>
          <p>Email: cleancaresupply@gmail.com</p>
          <p>Phone: +94751854938</p>
          <a href="mailto:cleancaresupply@gmail.com" className="btn btn-primary mt-1">Contact Support</a>
        </div>
      </div>
      <div className="footer-bottom container">
        <p>&copy; {new Date().getFullYear()} CleanCare Supply. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
