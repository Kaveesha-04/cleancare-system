import React, { useContext } from 'react';
import { CurrencyContext } from '../../context/CurrencyContext';

const POSSidebar = ({ cart, updateQuantity, removeItem, handleCheckout, error }) => {
  const { formatPrice } = useContext(CurrencyContext);

  const totalRawLKR = cart.reduce((acc, item) => {
    const discountedPrice = item.discount > 0 ? item.price * (1 - (item.discount / 100)) : item.price;
    return acc + (discountedPrice * item.quantity);
  }, 0);

  return (
    <div className="pos-sidebar">
      <div className="pos-brand">
        <h2>CleanCare <span>POS</span></h2>
        <p>Terminal 01</p>
      </div>

      <div className="pos-cart">
        {cart.map(item => (
          <div key={item.id} className="pos-cart-item">
            <div className="pos-item-info">
              <strong>{item.name}</strong>
              <span>{formatPrice(item.price, item.discount)}</span>
            </div>
            <div className="pos-item-actions">
              <button onClick={() => updateQuantity(item.id, -1)}>-</button>
              <span>{item.quantity}</span>
              <button onClick={() => updateQuantity(item.id, 1)}>+</button>
              <button className="pos-remove" onClick={() => removeItem(item.id)}>x</button>
            </div>
          </div>
        ))}
        {cart.length === 0 && <p className="pos-empty">Scan items to begin...</p>}
      </div>

      <div className="pos-footer">
        <div className="pos-total">
          <span>Total:</span>
          <span>{formatPrice(totalRawLKR)}</span>
        </div>
        {error && <div className="pos-error">{error}</div>}
        <div className="pos-pay-buttons">
          <button className="btn-pos cash" onClick={() => handleCheckout('Cash')}>Cash</button>
          <button className="btn-pos card" onClick={() => handleCheckout('Card')}>Card Terminal</button>
          <button className="btn-pos qr" onClick={() => handleCheckout('QR')}>QR / Wallet</button>
        </div>
      </div>
    </div>
  );
};

export default POSSidebar;
