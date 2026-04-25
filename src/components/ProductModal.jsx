import React, { useState, useContext, useEffect } from 'react';
import { CartContext } from '../context/CartContext';
import { CurrencyContext } from '../context/CurrencyContext';
import { AuthContext } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import './ProductModal.css';

const ProductModal = ({ product, onClose }) => {
  const { addToCart } = useContext(CartContext);
  const { formatPrice } = useContext(CurrencyContext);
  const { user } = useContext(AuthContext);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [localRating, setLocalRating] = useState(0);
  const [localReviews, setLocalReviews] = useState(0);

  useEffect(() => {
    if (product) {
      setLocalRating(product.rating || 0);
      setLocalReviews(product.numReviews || 0);
    }
  }, [product]);

  if (!product) return null;

  const activePrice = user?.role === 'wholesale' && product.wholesalePrice ? product.wholesalePrice : product.price;

  const handleAddToCart = () => {
    // Add specifically requested quantity with active price locked in
    addToCart({ ...product, price: activePrice, quantity });
    setAdded(true);
    
    // Quick toast effect before closing
    setTimeout(() => {
        onClose();
        setAdded(false);
    }, 1200);
  };

  const handleOverlayClick = (e) => {
    if (e.target.className === 'product-modal-overlay') {
      onClose();
    }
  };

  const handleRate = async (stars) => {
    try {
      const res = await fetch(`${API_BASE_URL}/products/${product.id || product._id}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: stars })
      });
      if (res.ok) {
         const updated = await res.json();
         setLocalRating(updated.rating);
         setLocalReviews(updated.numReviews);
         // Broadcast to grid
         const channel = new BroadcastChannel('inventory_sync');
         channel.postMessage('update');
      }
    } catch(e) {
      console.error(e);
    }
  };

  return (
    <div className="product-modal-overlay" onClick={handleOverlayClick}>
      <div className="product-modal-content">
        <button className="product-modal-close" onClick={onClose}>×</button>
        
        <div className="product-modal-grid">
            <div className="product-modal-image-col">
                <img src={product.image} alt={product.name} />
                {product.discount > 0 && <span className="modal-discount-tag">Save {product.discount}%</span>}
            </div>
            
            <div className="product-modal-details-col">
                <h2 className="modal-title">{product.name}</h2>
                
                <div className="modal-rating">
                    <span className="stars" style={{cursor: 'pointer', fontSize: '1.2rem', color: '#fbbf24', marginRight: '0.5rem'}} title="Click to rate this product">
                      {[1,2,3,4,5].map(star => (
                        <span key={star} onClick={() => handleRate(star)} style={{color: star <= Math.round(localRating) ? '#fbbf24' : '#cbd5e1', transition: 'color 0.2s'}}>
                          {star <= Math.round(localRating) ? '★' : '☆'}
                        </span>
                      ))}
                    </span>
                    <span className="rating-count">{localReviews} Review{localReviews !== 1 && 's'}</span> | <span className="sku">SKU: CCS-{(product.id || product._id || '').substring(18) || '0000'}</span>
                </div>

                <div className="modal-price-block">
                    <div className="modal-price">
                        {user?.role === 'wholesale' && (
                          <span style={{fontSize: '0.8rem', color: '#16a34a', display: 'block', marginBottom: '0.2rem'}}>Wholesale Active</span>
                        )}
                        {product.discount > 0 && (
                          <span className="price-original">{formatPrice(activePrice)}</span>
                        )}
                        {formatPrice(activePrice, product.discount)}
                    </div>
                    <div className="stock-status">
                        {product.stock > 10 ? (
                            <span className="in-stock">✓ In Stock</span>
                        ) : (
                            <span className="low-stock">! Only {product.stock} left</span>
                        )}
                    </div>
                </div>

                <div className="modal-separator"></div>

                <div className="modal-description">
                    <h3>Product Overview</h3>
                    <p>{product.description}</p>
                    <ul className="modal-features">
                        <li>Commercial grade formulation</li>
                        <li>High performance efficiency</li>
                        <li>Standardized for large facilities</li>
                    </ul>
                </div>

                <div className="modal-actions">
                    <div className="quantity-selector">
                        <label>Qty:</label>
                        <select 
                            value={quantity} 
                            onChange={(e) => setQuantity(Number(e.target.value))}
                            disabled={added || product.stock <= 0}
                        >
                            {[...Array(Math.min(10, product.stock || 1)).keys()].map(n => (
                                <option key={n+1} value={n+1}>{n+1}</option>
                            ))}
                        </select>
                    </div>

                    <button 
                        className={`btn-add-cart-large ${added ? 'added' : ''}`}
                        onClick={handleAddToCart}
                        disabled={product.stock <= 0 || added}
                    >
                        {added ? '✓ Added to Cart' : 'Add to Cart'}
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
