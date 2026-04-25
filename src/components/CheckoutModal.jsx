import React, { useState } from 'react';
import './CheckoutModal.css';

const CheckoutModal = ({ amount, onConfirm, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [paymentType, setPaymentType] = useState('card');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate Stripe Elements processing time
    setTimeout(() => {
      setSuccess(true);
      setTimeout(() => {
        onConfirm(paymentType);
      }, 1500);
    }, 2000);
  };

  return (
    <div className="checkout-modal-overlay">
      <div className="checkout-modal-content">
        {success ? (
          <div className="checkout-success-view">
            <div className="success-checkmark">✓</div>
            <h2>Payment Successful</h2>
            <p>Your order is being processed.</p>
          </div>
        ) : (
          <>
            <div className="checkout-modal-header">
              <h2>Secure Checkout</h2>
              <button className="close-btn" onClick={onCancel}>&times;</button>
            </div>
            
            <div className="checkout-modal-body">
              <div className="checkout-amount-summary">
                <span>Total to Pay:</span>
                <strong>{amount}</strong>
              </div>

              <div className="checkout-payment-methods">
                <button 
                  className={`pm-btn ${paymentType === 'card' ? 'active' : ''}`}
                  onClick={() => setPaymentType('card')}
                  type="button"
                >
                  💳 Stripe (Card)
                </button>
                <button 
                  className={`pm-btn ${paymentType === 'paypal' ? 'active' : ''}`}
                  onClick={() => setPaymentType('paypal')}
                  type="button"
                >
                  🅿️ PayPal
                </button>
                <button 
                  className={`pm-btn ${paymentType === 'invoice' ? 'active' : ''}`}
                  onClick={() => setPaymentType('invoice')}
                  type="button"
                >
                  🏢 Local Invoice
                </button>
              </div>

              <form onSubmit={handleSubmit} className="checkout-form">
                {paymentType === 'card' ? (
                  <div className="stripe-mock-container">
                    <div className="form-group">
                      <label>Email Address</label>
                      <input type="email" required placeholder="you@company.com" />
                    </div>
                    <div className="form-group">
                      <label>Card Information</label>
                      <div className="stripe-mock-card-input">
                        <input type="text" required placeholder="Card number" className="card-number" maxLength="19" />
                        <input type="text" required placeholder="MM / YY" className="card-expiry" maxLength="7" />
                        <input type="text" required placeholder="CVC" className="card-cvc" maxLength="4" />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Name on Card</label>
                      <input type="text" required placeholder="Full Name" />
                    </div>
                  </div>
                ) : paymentType === 'paypal' ? (
                  <div className="paypal-mock-container" style={{textAlign: 'center', padding: '2rem 1rem'}}>
                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" style={{height: '30px', marginBottom: '1rem'}} />
                    <p style={{color: 'var(--color-text-muted)', marginBottom: '1rem'}}>You will be redirected to PayPal to complete your purchase securely.</p>
                  </div>
                ) : (
                  <div className="invoice-mock-container">
                    <div className="form-group">
                      <label>Registered Account Name</label>
                      <input type="text" required placeholder="E.g. CleanCare Industries LLC" />
                    </div>
                    <div className="form-group">
                      <label>Purchase Order (PO) Number</label>
                      <input type="text" required placeholder="PO-123456" />
                    </div>
                    <p className="invoice-terms">By proceeding, you agree to our Net-30 terms. An invoice will be emailed to your registered administrative account.</p>
                  </div>
                )}
                
                <button 
                  type="submit" 
                  className={`btn-pay-now ${loading ? 'loading' : ''}`}
                  disabled={loading}
                >
                  {loading ? 'Processing Securely...' : `Pay ${amount}`}
                </button>
                <p className="secure-badge">🔒 Payments are securely processed via industry standard encryption.</p>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CheckoutModal;
