import React, { useState, useEffect, useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { CurrencyContext } from '../context/CurrencyContext';
import FeedbackModal from './FeedbackModal';
import AccountModal from './AccountModal';
import OrdersModal from './OrdersModal';
import './Navbar.css';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const { cartItemCount, toggleCart } = useContext(CartContext);
  const { user, logout } = useContext(AuthContext);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container nav-container">
        <a href="/" className="logo">
          CleanCare<span>Supply</span>
        </a>

        {/* Global Search Bar - Amazon/Zogics Style */}
        <form 
          className="nav-search-container" 
          onSubmit={(e) => {
            e.preventDefault();
            window.location.href = `/?search=${encodeURIComponent(searchQuery)}#products`;
          }}
        >
          <input 
            type="text" 
            placeholder="Search cleaning supplies, equipment, and more..." 
            className="nav-search-input" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="nav-search-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </button>
        </form>

          <div className="nav-links">
            <a href="/" className="nav-link">Home</a>
            
            {user ? (
              <div className="nav-user-dropdown-container">
                <button className="nav-user-btn">
                  Welcome, {user.name || 'User'} <span>▾</span>
                </button>
                <div className="nav-user-dropdown-menu">
                  {user.role !== 'admin' && (
                    <div className="dropdown-points">⭐ {user.loyaltyPoints} Reward Points</div>
                  )}
                  <button onClick={() => setShowAccountModal(true)} className="dropdown-item dropdown-btn-style">My Account</button>
                  <button onClick={() => setShowOrdersModal(true)} className="dropdown-item dropdown-btn-style">Order History</button>
                  <button onClick={() => setShowFeedback(true)} className="dropdown-item dropdown-btn-style">Rate Recent Delivery</button>
                  <button onClick={logout} className="dropdown-item logout-btn">Sign Out</button>
                </div>
              </div>
            ) : (
              <a href="/login" className="nav-link btn-nav-accent">Account & Sign In</a>
            )}

          <button className="btn btn-primary cart-toggle" onClick={toggleCart}>
            Cart
            {cartItemCount > 0 && <span className="cart-badge">{cartItemCount}</span>}
          </button>
        </div>
      </div>
      
      {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} />}
      {showAccountModal && <AccountModal onClose={() => setShowAccountModal(false)} />}
      {showOrdersModal && <OrdersModal onClose={() => setShowOrdersModal(false)} />}
    </nav>
  );
};

export default Navbar;
