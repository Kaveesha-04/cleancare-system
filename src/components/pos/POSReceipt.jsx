import React, { useContext } from 'react';
import { CurrencyContext } from '../../context/CurrencyContext';

const POSReceipt = ({ lastOrder }) => {
  const { formatPrice } = useContext(CurrencyContext);

  if (!lastOrder) return null;

  return (
    <div className="receipt-print-container">
      <div className="receipt-header">
        <h2>CleanCare Supply</h2>
        <p>123 Industrial Way<br/>Retail Park</p>
        <p>Receipt #{lastOrder.id}</p>
        <p>{lastOrder.date}</p>
      </div>
      <div className="receipt-items">
        {lastOrder.items.map(item => (
          <div key={item.id} className="receipt-item">
            <span>{item.quantity}x {item.name.substring(0,18)}</span>
            <span>{formatPrice(item.price * item.quantity, item.discount)}</span>
          </div>
        ))}
      </div>
      <div className="receipt-totals">
        <div className="receipt-row">
          <strong>TOTAL</strong>
          <strong>{formatPrice(lastOrder.total)}</strong>
        </div>
        <div className="receipt-row">
          <span>Payment Type:</span>
          <span>{lastOrder.method}</span>
        </div>
      </div>
      <div className="receipt-footer">
        <p>Thank you for your business!</p>
        <p>Returns accepted within 30 days w/ receipt.</p>
      </div>
    </div>
  );
};

export default POSReceipt;
