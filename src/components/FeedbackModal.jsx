import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import './FeedbackModal.css';

const FeedbackModal = ({ onClose }) => {
  const { user } = useContext(AuthContext);
  const [overallRating, setOverallRating] = useState(0);
  const [deliverySpeed, setDeliverySpeed] = useState(0);
  const [quality, setQuality] = useState(0);
  const [comments, setComments] = useState('');
  const [itemRatings, setItemRatings] = useState([]);
  
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState({ loading: false, success: false, error: null });

  useEffect(() => {
    fetch(`${API_BASE_URL}/products`)
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error("Could not fetch products for feedback", err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!overallRating || !deliverySpeed || !quality) {
      setStatus({ ...status, error: 'Please select a star rating for all primary fields.' });
      return;
    }
    
    setStatus({ loading: true, success: false, error: null });
    
    try {
      const res = await fetch(`${API_BASE_URL}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || null,
          overallRating,
          deliverySpeed,
          quality,
          itemRatings,
          comments
        })
      });
      
      if (!res.ok) throw new Error('Failed to submit feedback');
      
      setStatus({ loading: false, success: true, error: null });
      setTimeout(() => onClose(), 2000);
    } catch (err) {
      setStatus({ loading: false, success: false, error: err.message });
    }
  };

  const StarRater = ({ value, onChange }) => (
    <div className="feedback-stars">
      {[1, 2, 3, 4, 5].map(star => (
        <span 
          key={star} 
          onClick={() => onChange(star)}
          className={star <= value ? 'star-active' : 'star-inactive'}
        >
          {star <= value ? '★' : '☆'}
        </span>
      ))}
    </div>
  );

  const handleAddProduct = (e) => {
    const pId = e.target.value;
    if (!pId) return;
    const p = products.find(x => (x.id || x._id) === pId);
    if (p && !itemRatings.some(i => i.productId === pId)) {
      setItemRatings([...itemRatings, { productId: pId, productName: p.name, rating: 0 }]);
    }
    e.target.value = ""; // reset dropdown
  };

  const setItemRating = (pId, newRating) => {
    setItemRatings(itemRatings.map(i => i.productId === pId ? { ...i, rating: newRating } : i));
  };

  const removeItem = (pId) => {
    setItemRatings(itemRatings.filter(i => i.productId !== pId));
  };

  return (
    <div className="feedback-overlay" onClick={(e) => e.target.className === 'feedback-overlay' && onClose()}>
      <div className="feedback-content">
        <div className="feedback-header">
          <h2>Rate Your Delivery</h2>
          <button className="feedback-close" onClick={onClose}>&times;</button>
        </div>
        
        <div className="feedback-body">
          {status.success ? (
            <div className="feedback-success">
              <div className="success-icon">✓</div>
              <h3>Thank You!</h3>
              <p>Your feedback helps us maintain premium service standards.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="feedback-form">
              <p className="feedback-subtitle">Let us know how we did with your recent order.</p>
              
              {status.error && <div className="feedback-error">{status.error}</div>}
              
              <div className="rating-group">
                <label>Overall Experience</label>
                <StarRater value={overallRating} onChange={setOverallRating} />
              </div>
              
              <div className="rating-group">
                <label>Delivery Speed</label>
                <StarRater value={deliverySpeed} onChange={setDeliverySpeed} />
              </div>
              
              <div className="rating-group">
                <label>Product Quality Condition</label>
                <StarRater value={quality} onChange={setQuality} />
              </div>

              <div className="form-group" style={{marginTop: '2rem', borderTop: '2px solid #f1f5f9', paddingTop: '1.5rem'}}>
                <label>Rate Specific Items from Your Order</label>
                <select className="product-selector" onChange={handleAddProduct} defaultValue="">
                  <option value="" disabled>-- Select a Product --</option>
                  {products.map(p => (
                    <option key={p.id || p._id} value={p.id || p._id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {itemRatings.length > 0 && (
                <div className="item-ratings-list">
                  {itemRatings.map(item => (
                    <div key={item.productId} className="item-rating-row">
                      <div className="item-rating-info">
                        <button type="button" className="remove-item-btn" onClick={() => removeItem(item.productId)}>&times;</button>
                        <span className="item-name">{item.productName}</span>
                      </div>
                      <StarRater value={item.rating} onChange={(val) => setItemRating(item.productId, val)} />
                    </div>
                  ))}
                </div>
              )}

              <div className="form-group" style={{marginTop: '1.5rem'}}>
                <label>Additional Comments</label>
                <textarea 
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Tell us what you loved or how we can improve..."
                  rows="4"
                ></textarea>
              </div>

              <button type="submit" disabled={status.loading} className="btn btn-primary submit-feedback">
                {status.loading ? 'Submitting...' : 'Submit Assessment'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;
