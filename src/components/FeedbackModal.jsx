import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import './FeedbackModal.css';

const FeedbackModal = ({ onClose }) => {
  const { user } = useContext(AuthContext);
  const [rating, setRating] = useState(0);
  const [deliverySpeed, setDeliverySpeed] = useState(0);
  const [quality, setQuality] = useState(0);
  const [comments, setComments] = useState('');
  const [status, setStatus] = useState({ loading: false, success: false, error: null });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating || !deliverySpeed || !quality) {
      setStatus({ ...status, error: 'Please select a star rating for all fields.' });
      return;
    }
    
    setStatus({ loading: true, success: false, error: null });
    
    try {
      const res = await fetch(`${API_BASE_URL}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || null,
          rating,
          deliverySpeed,
          quality,
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
                <StarRater value={rating} onChange={setRating} />
              </div>
              
              <div className="rating-group">
                <label>Delivery Speed</label>
                <StarRater value={deliverySpeed} onChange={setDeliverySpeed} />
              </div>
              
              <div className="rating-group">
                <label>Product Quality Condition</label>
                <StarRater value={quality} onChange={setQuality} />
              </div>

              <div className="form-group">
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
