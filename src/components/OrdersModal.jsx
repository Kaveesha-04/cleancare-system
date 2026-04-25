import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { CurrencyContext } from '../context/CurrencyContext';
import { API_BASE_URL } from '../config';
import './OrdersModal.css';

const OrdersModal = ({ onClose }) => {
  const { user } = useContext(AuthContext);
  const { formatPrice } = useContext(CurrencyContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/orders/my-orders`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch order history');
        const data = await res.json();
        setOrders(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  if (!user) return null;

  return (
    <div className="orders-overlay" onClick={(e) => e.target.className === 'orders-overlay' && onClose()}>
      <div className="orders-content">
        <div className="orders-header">
          <h2>Order History</h2>
          <button className="orders-close" onClick={onClose}>&times;</button>
        </div>
        
        <div className="orders-body">
          {loading ? (
            <div className="orders-loading">Loading your order history...</div>
          ) : error ? (
            <div className="orders-error">{error}</div>
          ) : orders.length === 0 ? (
            <div className="orders-empty">
              <p>You haven't placed any orders yet.</p>
              <button className="btn btn-outline" onClick={onClose}>Continue Shopping</button>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map(order => (
                <div key={order._id} className="order-card">
                  <div className="order-card-header">
                    <div className="order-meta">
                      <span className="order-date">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'long', day: 'numeric'
                        })}
                      </span>
                      <span className="order-id">Order #{order._id.substring(18).toUpperCase()}</span>
                    </div>
                    <div className="order-total">{formatPrice(order.finalTotal)}</div>
                  </div>
                  
                  <div className="order-card-body">
                    <div className="order-detail-grid">
                      <div className="detail-column">
                        <small>Total Items</small>
                        <span>{order.items?.reduce((sum, i) => sum + i.quantity, 0) || 0}</span>
                      </div>
                      <div className="detail-column">
                        <small>Payment Method</small>
                        <span>{order.paymentMethod}</span>
                      </div>
                      <div className="detail-column">
                        <small>Reward Points Earned</small>
                        <span style={{color: '#10b981', fontWeight: 'bold'}}>+{order.pointsEarned} ⭐</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrdersModal;
