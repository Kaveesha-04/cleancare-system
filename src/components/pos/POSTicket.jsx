import React, { useContext, useState } from 'react';
import { CurrencyContext } from '../../context/CurrencyContext';
import { AuthContext } from '../../context/AuthContext';

const POSTicket = ({ cart, updateQuantity, removeItem, clearTicket, handleCheckout, error }) => {
  const { formatPrice } = useContext(CurrencyContext);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const { user } = useContext(AuthContext); // Access user to check if retail/wholesale rules apply

  const [overrideTier, setOverrideTier] = useState('retail');
  const [manualDiscountPercent, setManualDiscountPercent] = useState(0);

  const totalRawLKR = cart.reduce((acc, item) => {
    const isWholesale = overrideTier === 'wholesale' || user?.role === 'wholesale';
    const activePrice = isWholesale && item.wholesalePrice ? item.wholesalePrice : item.price;
    const activeDiscount = isWholesale ? (item.wholesaleDiscount || 0) : (item.retailDiscount || item.discount || 0);
    const discountedPrice = activeDiscount > 0 ? activePrice * (1 - (activeDiscount / 100)) : activePrice;
    return acc + (discountedPrice * item.quantity);
  }, 0);
  
  const finalTotalLKR = manualDiscountPercent > 0 
    ? totalRawLKR * (1 - (manualDiscountPercent / 100)) 
    : totalRawLKR;

  const onCheckoutClick = (method) => {
    handleCheckout(method, overrideTier, manualDiscountPercent);
    setShowPaymentModal(false);
  };

  return (
    <div className="pos-ticket-container">
      {/* Top Header */}
      <div className="pos-ticket-header">
        <div className="pos-ticket-header-top">
            <h2>Ticket</h2>
            <button className="pos-ticket-clear-btn" onClick={clearTicket} disabled={cart.length === 0}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
        </div>
      </div>

      {/* Cart Items List */}
      <div className="pos-ticket-items">
        {cart.map(item => {
          const isWholesale = overrideTier === 'wholesale' || user?.role === 'wholesale';
          const activePrice = isWholesale && item.wholesalePrice ? item.wholesalePrice : item.price;
          const activeDiscount = isWholesale ? (item.wholesaleDiscount || 0) : (item.retailDiscount || item.discount || 0);
          
          return (
          <div key={item.id} className="pos-ticket-item">
            <div className="pos-ticket-item-main">
                <span className="pos-ticket-item-name">{item.name}</span>
                <span className="pos-ticket-item-price">{formatPrice(activePrice, activeDiscount)}</span>
            </div>
            <div className="pos-ticket-item-sub">
                <div className="pos-ticket-qty-controls">
                  <button onClick={() => updateQuantity(item.id, -1)}>-</button>
                  <input type="text" value={item.quantity} readOnly />
                  <button onClick={() => updateQuantity(item.id, 1)}>+</button>
                </div>
                <div style={{color: 'var(--color-primary)', fontWeight: 'bold'}}>
                  {formatPrice((activePrice * (1 - (activeDiscount || 0)/100)) * item.quantity)}
                </div>
            </div>
          </div>
        )})}
        {cart.length === 0 && (
            <div className="pos-ticket-empty">
                <div className="empty-icon">🛒</div>
                <p>No items in the ticket</p>
            </div>
        )}
      </div>

      {/* Footer & Charge Button */}
      <div className="pos-ticket-footer">
        {error && <div className="pos-ticket-error">{error}</div>}
        
        <div style={{display: 'flex', gap: '0.5rem', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px dashed var(--color-border)'}}>
           <div style={{flex: 1}}>
              <label style={{fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--color-text-muted)'}}>Walk-in Customer Tier</label>
              <select value={overrideTier} onChange={e => setOverrideTier(e.target.value)} style={{width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)'}}>
                 <option value="retail">Retail Account</option>
                 <option value="wholesale">Wholesale Partner</option>
              </select>
           </div>
           <div style={{flex: 1}}>
              <label style={{fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--color-text-muted)'}}>Manual Discount (%)</label>
              <input type="number" min="0" max="100" value={manualDiscountPercent} onChange={e => setManualDiscountPercent(e.target.value)} style={{width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)'}} placeholder="0%" />
           </div>
        </div>

        <div className="pos-ticket-summary">
            <div className="summary-row">
                <span>Total</span>
                <span className="summary-total">{formatPrice(finalTotalLKR)}</span>
            </div>
        </div>

        {/* Charge Button */}
        <button 
            className="btn-pos-charge" 
            disabled={cart.length === 0}
            onClick={() => setShowPaymentModal(!showPaymentModal)}
        >
            CHARGE {formatPrice(finalTotalLKR)}
        </button>

        {/* Pseudo Modal for Payment Methods (Loyverse style slide-up) */}
        {showPaymentModal && cart.length > 0 && (
            <div className="pos-payment-modal">
                <h3>Select Payment Type</h3>
                <div className="pos-payment-grid">
                    <button className="payment-btn cash" onClick={() => onCheckoutClick('Cash')}>Cash</button>
                    <button className="payment-btn card" onClick={() => onCheckoutClick('Card')}>Card</button>
                    <button className="payment-btn qr" onClick={() => onCheckoutClick('QR')}>QR/Wallet</button>
                </div>
                <button className="payment-cancel-btn" onClick={() => setShowPaymentModal(false)}>Cancel</button>
            </div>
        )}
      </div>
    </div>
  );
};

export default POSTicket;
