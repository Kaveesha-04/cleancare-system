import React, { useState, useEffect, useContext } from 'react';
import { CurrencyContext } from '../context/CurrencyContext';
import { API_BASE_URL } from '../config';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { formatPrice } = useContext(CurrencyContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };

        const [ordersRes, productsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/orders`, { headers }),
          fetch(`${API_BASE_URL}/products`)
        ]);

        if (!ordersRes.ok) {
          const errData = await ordersRes.json().catch(()=>({}));
          throw new Error(errData.error || `Orders API failed with status: ${ordersRes.status}`);
        }
        if (!productsRes.ok) {
          const errData = await productsRes.json().catch(()=>({}));
          throw new Error(errData.error || `Products API failed with status: ${productsRes.status}`);
        }

        const ordersData = await ordersRes.json();
        const productsData = await productsRes.json();

        setOrders(ordersData);
        setProducts(productsData);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div style={{padding: '5rem', textAlign: 'center'}}>Loading Financials...</div>;
  if (error) return <div style={{padding: '5rem', textAlign: 'center', color: 'red'}}>Error: {error}</div>;

  // Analysis Calculations
  const totalRevenue = orders.reduce((acc, order) => acc + order.finalTotal, 0);
  const onlineOrders = orders.filter(o => o.orderType !== 'pos');
  const posOrders = orders.filter(o => o.orderType === 'pos');
  
  const onlineRevenue = onlineOrders.reduce((acc, order) => acc + order.finalTotal, 0);
  const posRevenue = posOrders.reduce((acc, order) => acc + order.finalTotal, 0);

  const lowStockItems = products.filter(p => p.stock < 10);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>CleanCare Financial Dashboard</h1>
        <p>Real-time analytics and inventory alerts</p>
      </div>

      {lowStockItems.length > 0 && (
        <div className="alert-panel">
          <h2>⚠️ Critical Inventory Alerts (Stock &lt; 10)</h2>
          <ul className="low-stock-list">
            {lowStockItems.map(item => (
              <li key={item.id} className="low-stock-item">
                <span><strong>{item.name}</strong> (SKU: {item.barcode})</span>
                <span style={{fontWeight: 'bold'}}>Only {item.stock} left</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="dashboard-grid">
        <div className="stat-card">
          <h3>Total Gross Revenue</h3>
          <div className="stat-value">{formatPrice(totalRevenue)}</div>
          <p style={{fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop:'0.5rem'}}>{orders.length} Total Orders</p>
        </div>
        <div className="stat-card" style={{borderLeft: '4px solid #3b82f6'}}>
          <h3>E-Commerce Sales (Web)</h3>
          <div className="stat-value">{formatPrice(onlineRevenue)}</div>
          <p style={{fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop:'0.5rem'}}>{onlineOrders.length} Online Transactions</p>
        </div>
        <div className="stat-card" style={{borderLeft: '4px solid #ec4899'}}>
          <h3>Retail Terminals (POS)</h3>
          <div className="stat-value">{formatPrice(posRevenue)}</div>
          <p style={{fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop:'0.5rem'}}>{posOrders.length} In-Store Transactions</p>
        </div>
      </div>

      <div className="orders-panel">
        <h2>Recent Transactions</h2>
        <div style={{overflowX: 'auto'}}>
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Origin</th>
                <th>Payment Method</th>
                <th>Final Total</th>
              </tr>
            </thead>
            <tbody>
              {[...orders].reverse().map(order => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>{new Date(order.createdAt).toLocaleString()}</td>
                  <td>
                    <span className={`badge ${order.orderType === 'pos' ? 'badge-pos' : 'badge-online'}`}>
                      {order.orderType === 'pos' ? 'In-Store POS' : 'Online Store'}
                    </span>
                  </td>
                  <td>{order.paymentMethod}</td>
                  <td style={{fontWeight: 'bold', color: 'var(--color-primary)'}}>
                    {formatPrice(order.finalTotal)}
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan="5" style={{textAlign: 'center'}}>No transactions recorded yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
