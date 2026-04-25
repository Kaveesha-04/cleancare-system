import React, { useState, useEffect, useContext } from 'react';
import { CurrencyContext } from '../context/CurrencyContext';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { API_BASE_URL } from '../config';
import './AdminInventory.css';

const AdminInventory = () => {
  const [products, setProducts] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [newDepartmentName, setNewDepartmentName] = useState('');
  const [newSectionName, setNewSectionName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [orders, setOrders] = useState([]);
  const [scanning, setScanning] = useState(false);
  
  // New Product Form State
  const [newProduct, setNewProduct] = useState({
    name: '',
    department: '',
    section: '',
    price: '',
    wholesalePrice: '',
    stock: '',
    barcode: '',
    image: ''
  });
  
  const { formatPrice } = useContext(CurrencyContext);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const [prodRes, deptRes, ordRes] = await Promise.all([
        fetch(`${API_BASE_URL}/products`),
        fetch(`${API_BASE_URL}/departments`),
        fetch(`${API_BASE_URL}/orders`, { headers: { 'Authorization': `Bearer ${token}` }})
      ]);
      
      if (!prodRes.ok) throw new Error('Failed to fetch products');
      
      const prodData = await prodRes.json();
      const deptData = deptRes.ok ? await deptRes.json() : [];
      const ordData = ordRes.ok ? await ordRes.json() : [];
      
      setProducts(prodData);
      setDepartments(deptData);
      setOrders(ordData);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    let scanner = null;
    if (scanning) {
      scanner = new Html5QrcodeScanner('admin-barcode-reader', { fps: 10, qrbox: { width: 250, height: 100 } }, false);
      scanner.render((text) => {
        setNewProduct(prev => ({...prev, barcode: text}));
        scanner.clear();
        setScanning(false);
      }, (err) => {
        // Log errors silently during scanning
      });
    }
    return () => {
      if (scanner) {
        scanner.clear().catch(e => console.log('Scanner cleanup handled'));
      }
    };
  }, [scanning]);

  const handleUpdateRow = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const rowStock = document.getElementById(`stock-${id}`).value;
      const rowRetail = document.getElementById(`retail-${id}`).value;
      const rowWholesale = document.getElementById(`wholesale-${id}`).value;

      await Promise.all([
        fetch(`${API_BASE_URL}/products/${id}/stock`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ stock: parseInt(rowStock) })
        }),
        fetch(`${API_BASE_URL}/products/${id}/discount`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ retailDiscount: parseInt(rowRetail), wholesaleDiscount: parseInt(rowWholesale) })
        })
      ]);
      
      setProducts(prev => prev.map(p => p.id === id ? { 
        ...p, 
        stock: parseInt(rowStock), 
        retailDiscount: parseInt(rowRetail),
        wholesaleDiscount: parseInt(rowWholesale)
      } : p));
      
      const channel = new BroadcastChannel('inventory_sync');
      channel.postMessage('update');
      
      alert('Row global sync successful!');
    } catch (err) {
      alert('Sync failed: ' + err.message);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newProduct)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create product');
      
      setProducts([...products, data]);
      setNewProduct({ name: '', department: departments[0]?.name || '', section: '', price: '', wholesalePrice: '', stock: '', barcode: '', image: '' });
      
      const channel = new BroadcastChannel('inventory_sync');
      channel.postMessage('update');
      
      alert('Product Added to Global Ecosystem!');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    if (!newDepartmentName) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/departments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ departmentName: newDepartmentName, sectionName: newSectionName })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDepartments(data);
      if (!newSectionName) setNewDepartmentName('');
      setNewSectionName('');
      alert('Hierarchy updated successfully!');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('WARNING: Are you sure you want to permanently delete this product?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete');
      setProducts(prev => prev.filter(p => p.id !== id));
      
      const channel = new BroadcastChannel('inventory_sync');
      channel.postMessage('update');
    } catch (err) {
      alert(err.message);
    }
  };

  // Remove old handleStockUpdate as we now have full row edit

  if (loading) return <div style={{padding: '5rem', textAlign: 'center'}}>Loading Inventory...</div>;

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>CleanCare Supply Control Panel</h1>
        <p>Global Inventory, Analytics, & Discount Manager</p>
      </div>

      <div className="admin-content">
        {error && <div style={{color: 'red', marginBottom: '1rem'}}>{error}</div>}
        
        {/* ANALYTICS DASHBOARD ROW */}
        <div className="analytics-dashboard-row" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem'}}>
          
          <div className="metric-card" style={{background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', color: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}}>
            <h3 style={{fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.9, marginBottom: '0.5rem'}}>Total Gross Revenue</h3>
            <div style={{fontSize: '2rem', fontWeight: 'bold'}}>{formatPrice(orders.reduce((sum, ord) => sum + (ord.totalAmount || 0), 0))}</div>
            <p style={{fontSize: '0.8rem', opacity: 0.8, marginTop: '0.5rem'}}>Across {orders.length} successful transactions</p>
          </div>

          <div className="metric-card" style={{background: 'linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)', color: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}}>
            <h3 style={{fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.9, marginBottom: '0.5rem'}}>Sitting Inventory Value</h3>
            <div style={{fontSize: '2rem', fontWeight: 'bold'}}>{formatPrice(products.reduce((sum, p) => sum + (p.price * p.stock), 0))}</div>
            <p style={{fontSize: '0.8rem', opacity: 0.8, marginTop: '0.5rem'}}>Capital tied in raw stock (Retail Rate)</p>
          </div>

          <div className="metric-card" style={{background: 'linear-gradient(135deg, #b91c1c 0%, #ef4444 100%)', color: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}}>
            <h3 style={{fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.9, marginBottom: '0.5rem'}}>Critical Stock Alerts</h3>
            <div style={{fontSize: '2rem', fontWeight: 'bold'}}>{products.filter(p => p.stock < 10).length}</div>
            <p style={{fontSize: '0.8rem', opacity: 0.8, marginTop: '0.5rem'}}>Items with fewer than 10 units remaining</p>
          </div>

        </div>
        
        <div className="admin-add-product-section" style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', border: '1px solid #e2e8f0' }}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
            <h2 style={{ fontSize: '1.25rem', margin: 0, color: '#1e3a8a' }}>Add New Inventory Item</h2>
            <button onClick={() => setScanning(!scanning)} style={{background: scanning ? '#ef4444' : '#10b981', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'}}>
              {scanning ? '🛑 Stop Camera Scanning' : '📷 Scan Barcode via Camera'}
            </button>
          </div>

          {scanning && (
             <div id="admin-barcode-reader" style={{width: '100%', maxWidth: '400px', margin: '0 auto 1.5rem auto', border: '2px solid #3b82f6', borderRadius: '8px', overflow: 'hidden'}}></div>
          )}

          <form onSubmit={handleCreateProduct} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{gridColumn: '1 / -1'}}>
               <label style={{display:'block', marginBottom:'0.5rem', fontWeight:'bold'}}>Barcode (Scan or Type)</label>
               <input type="text" required value={newProduct.barcode} onChange={e => setNewProduct({...newProduct, barcode: e.target.value})} style={{width: '100%', padding: '0.75rem', border: '2px solid #3b82f6', borderRadius: '4px'}} placeholder="Click here & scan barcode..." autoFocus />
            </div>
            
            <div>
               <label style={{display:'block', marginBottom:'0.5rem', fontWeight:'bold'}}>Product Name</label>
               <input type="text" required value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} style={{width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px'}} />
            </div>
            <div>
               <label style={{display:'block', marginBottom:'0.5rem', fontWeight:'bold'}}>Department</label>
               <select required value={newProduct.department} onChange={e => setNewProduct({...newProduct, department: e.target.value, section: ''})} style={{width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px'}}>
                 <option value="" disabled>Select a Department...</option>
                 {departments.map(dept => <option key={dept.name} value={dept.name}>{dept.name}</option>)}
               </select>
            </div>
            <div>
               <label style={{display:'block', marginBottom:'0.5rem', fontWeight:'bold'}}>Section</label>
               <select required value={newProduct.section} onChange={e => setNewProduct({...newProduct, section: e.target.value})} disabled={!newProduct.department} style={{width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px'}}>
                 <option value="" disabled>Select a Section...</option>
                 {departments.find(d => d.name === newProduct.department)?.sections.map(sec => <option key={sec} value={sec}>{sec}</option>)}
               </select>
            </div>
            
            <div>
               <label style={{display:'block', marginBottom:'0.5rem', fontWeight:'bold'}}>Retail Price (LKR)</label>
               <input type="number" required value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} style={{width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px'}} />
            </div>
            <div>
               <label style={{display:'block', marginBottom:'0.5rem', fontWeight:'bold'}}>Wholesale Price (LKR)</label>
               <input type="number" required value={newProduct.wholesalePrice} onChange={e => setNewProduct({...newProduct, wholesalePrice: e.target.value})} style={{width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px'}} />
            </div>
            
            <div>
               <label style={{display:'block', marginBottom:'0.5rem', fontWeight:'bold'}}>Stock Quantity</label>
               <input type="number" required value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} style={{width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px'}} />
            </div>
            <div>
               <label style={{display:'block', marginBottom:'0.5rem', fontWeight:'bold'}}>Image URL (Optional)</label>
               <input type="text" value={newProduct.image} onChange={e => setNewProduct({...newProduct, image: e.target.value})} style={{width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px'}} />
            </div>
            
            <div style={{gridColumn: '1 / -1', marginTop: '1rem'}}>
               <button type="submit" style={{width: '100%', background: '#1e3a8a', color: 'white', padding: '1rem', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem'}}>
                 + Create & Sync Product
               </button>
            </div>
          </form>
        </div>

        <div className="admin-add-product-section" style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', border: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', alignItems: 'flex-end' }}>
          <div style={{flexGrow: 1}}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#1e3a8a' }}>Category Management</h2>
            <input type="text" value={newDepartmentName} onChange={e => setNewDepartmentName(e.target.value)} style={{width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px'}} placeholder="New/Existing Department..." />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'transparent' }}>&nbsp;</h2>
            <input type="text" value={newSectionName} onChange={e => setNewSectionName(e.target.value)} style={{width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px'}} placeholder="New Sub-Section (Optional)..." />
          </div>
          <button onClick={handleCreateDepartment} style={{background: '#16a34a', color: 'white', padding: '0.75rem 1.5rem', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap'}}>
            + Map Hierarchy
          </button>
        </div>

        <table className="inventory-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Product Details</th>
              <th>Base Price</th>
              <th>Stock Qty</th>
              <th>Retail %</th>
              <th>Wholesale %</th>
              <th>Admin Control</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>
                  <strong>{product.name}</strong><br/>
                  <small style={{color: '#64748b'}}>{product.department} &rsaquo; {product.section}</small><br/>
                  <small>{product.barcode}</small>
                </td>
                <td>{formatPrice(product.price)}</td>
                <td>
                  <input type="number" min="0" defaultValue={product.stock} id={`stock-${product.id}`} className="discount-input" />
                </td>
                <td>
                  <input type="number" min="0" max="100" defaultValue={product.retailDiscount || product.discount} id={`retail-${product.id}`} className="discount-input" />
                </td>
                <td>
                  <input type="number" min="0" max="100" defaultValue={product.wholesaleDiscount || 0} id={`wholesale-${product.id}`} className="discount-input" style={{borderColor: '#16a34a'}} />
                </td>
                <td>
                  <button 
                    className="btn-sync"
                    onClick={() => handleUpdateRow(product.id)}
                  >
                    Sync Row
                  </button>
                  <button 
                    onClick={() => handleDeleteProduct(product.id)}
                    style={{marginLeft: '0.5rem', background: '#ef4444', color: 'white', border: 'none', padding: '0.4rem 0.5rem', borderRadius:'4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold'}}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminInventory;
