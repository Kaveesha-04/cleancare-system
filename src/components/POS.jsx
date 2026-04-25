import React, { useState, useEffect, useRef, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import POSTicket from './pos/POSTicket';
import POSGrid from './pos/POSGrid';
import POSReceipt from './pos/POSReceipt';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { API_BASE_URL } from '../config';
import './POS.css';

const POS = () => {
  const [cart, setCart] = useState([]);
  const [barcodeBuffer, setBarcodeBuffer] = useState('');
  const [error, setError] = useState('');
  const [lastOrder, setLastOrder] = useState(null);
  
  // New state for Grid
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [scanning, setScanning] = useState(false);
  const { logout } = useContext(AuthContext);

  // Focus ref to keep scanner active
  const hiddenInputRef = useRef(null);

  const fetchProducts = () => {
    const token = localStorage.getItem('token');
    fetch(`${API_BASE_URL}/products`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoadingProducts(false);
      })
      .catch(err => {
        console.error("Failed to load products for POS", err);
        setLoadingProducts(false);
      });
  };

  useEffect(() => {
    // Keep focus on the hidden input to capture barcode scanner strokes globally
    const focusScanner = () => {
      // Don't steal focus if user is typing in a real text input
      if (document.activeElement && document.activeElement.tagName === 'INPUT' && document.activeElement !== hiddenInputRef.current) {
        return;
      }
      if (hiddenInputRef.current) {
        hiddenInputRef.current.focus();
      }
    };
    
    focusScanner();
    window.addEventListener('click', focusScanner);

    fetchProducts();
    
    // Listen for real-time inventory adjustments across ALL tabs
    const channel = new BroadcastChannel('inventory_sync');
    channel.onmessage = (event) => {
      if (event.data === 'update') {
        fetchProducts();
      }
    };

    return () => {
        window.removeEventListener('click', focusScanner);
        channel.close();
    };
  }, []);

  useEffect(() => {
    let scanner = null;
    if (scanning) {
      scanner = new Html5QrcodeScanner('pos-barcode-reader', { fps: 10, qrbox: { width: 250, height: 100 } }, false);
      scanner.render((text) => {
        setBarcodeBuffer(text);
        
        // Auto-submit the captured scan
        async function fetchScanData(barcode) {
            try {
              const token = localStorage.getItem('token');
              const response = await fetch(`${API_BASE_URL}/products/scan/${barcode}`, {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              if (!response.ok) throw new Error('Product not found');
              const product = await response.json();
              handleAddToTicket(product);
              setError('');
            } catch (err) {
              setError(err.message + ` (${barcode})`);
            }
        }
        fetchScanData(text);
        
        scanner.clear();
        setScanning(false);
        setBarcodeBuffer('');
      }, (err) => {
        // silent validation
      });
    }
    return () => {
      if (scanner) {
        scanner.clear().catch(e => console.log('Scanner cleanup handled'));
      }
    };
  }, [scanning]);

  const handleBarcodeSubmit = async (e) => {
    e.preventDefault();
    if (!barcodeBuffer.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/products/scan/${barcodeBuffer}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Product not found / Unauthorized');
      
      const product = await response.json();
      
      // Add to cart via scanning
      handleAddToTicket(product);
      setError('');
    } catch (err) {
      setError(err.message + ` (${barcodeBuffer})`);
    }
    setBarcodeBuffer(''); // Reset buffer instantly
  };

  const handleAddToTicket = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? {...item, quantity: item.quantity + 1} : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id, amount) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQ = item.quantity + amount;
        return newQ > 0 ? { ...item, quantity: newQ } : item;
      }
      return item;
    }));
  };

  const removeItem = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };
  
  const clearTicket = () => setCart([]);

  const handleCheckout = async (paymentMethod, overrideTier, manualDiscountPercent) => {
    if (cart.length === 0) return;

    const payload = {
      orderType: 'pos',
      paymentMethod,
      overrideTier,
      manualDiscountPercent: Number(manualDiscountPercent) || 0,
      items: cart.map(i => ({ id: i.id, quantity: i.quantity }))
    };

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/checkout`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Checkout failed');
      }
      
      const data = await res.json();
      
      // Save last order for receipt printing
      setLastOrder({
        id: data.orderId,
        total: data.total,
        items: [...cart],
        method: paymentMethod,
        date: new Date().toLocaleString()
      });

      setCart([]);
      
      // Global Inventory Real-Time Sync reload locally and across tabs
      fetchProducts();
      const channel = new BroadcastChannel('inventory_sync');
      channel.postMessage('update');
      
      // Trigger native browser print for the receipt panel
      setTimeout(() => window.print(), 500);

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="pos-layout-loyverse">
      {/* Hidden input for Barcode Scanner (Scanner acts as keyboard) */}
      <form onSubmit={handleBarcodeSubmit} className="scanner-form" style={{position: 'absolute', opacity: 0}}>
        <input 
          ref={hiddenInputRef}
          type="text" 
          value={barcodeBuffer}
          onChange={(e) => setBarcodeBuffer(e.target.value)}
          className="scanner-hidden-input"
          autoFocus
        />
      </form>
      
      {/* Absolute Modal for Camera Scanning */}
      {scanning && (
        <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
            <div style={{background: 'white', padding: '1rem', borderRadius: '8px', maxWidth: '500px', width: '100%'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1rem'}}>
                 <h3 style={{margin: 0}}>Scan Article</h3>
                 <button onClick={() => setScanning(false)} style={{background: '#ef4444', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer'}}>Close</button>
              </div>
              <div id="pos-barcode-reader" style={{width: '100%', overflow: 'hidden'}}></div>
            </div>
        </div>
      )}

      {/* LEFT PANEL: Interactive Product Grid */}
      <POSGrid 
        products={products}
        loading={loadingProducts}
        onProductClick={handleAddToTicket}
        onScanClick={() => setScanning(true)}
      />

      {/* RIGHT PANEL: The Ticket / Cart */}
      <POSTicket 
        cart={cart}
        updateQuantity={updateQuantity}
        removeItem={removeItem}
        clearTicket={clearTicket}
        handleCheckout={handleCheckout}
        error={error}
      />

      {/* RECEIPT PRINT LAYOUT - Only visible during window.print() */}
      <POSReceipt lastOrder={lastOrder} />
    </div>
  );
};

export default POS;
