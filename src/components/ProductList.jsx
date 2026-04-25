import React, { useContext, useState, useEffect } from 'react';
import { CurrencyContext } from '../context/CurrencyContext';
import { AuthContext } from '../context/AuthContext';
import ProductModal from './ProductModal';
import { API_BASE_URL } from '../config';
import './ProductList.css';

const ProductList = () => {
  const { formatPrice } = useContext(CurrencyContext);
  const { user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Extract search query from URL
  const queryParams = new URLSearchParams(window.location.search);
  const searchQuery = queryParams.get('search') || '';
  
  // Modal state
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchProducts = () => {
    fetch(`${API_BASE_URL}/products`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch products');
        return res.json();
      })
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts();
    
    // Listen for real-time inventory adjustments from checkout
    const handleInventoryUpdate = () => {
      fetchProducts();
    };
    window.addEventListener('inventory-updated', handleInventoryUpdate);
    return () => window.removeEventListener('inventory-updated', handleInventoryUpdate);
  }, []);

  if (loading) return <div className="section-padding text-center">Loading Products...</div>;
  if (error) return <div className="section-padding text-center" style={{color: 'red'}}>Error: {error}</div>;

  // Filter products by search query
  const filteredProducts = products.filter(p => {
    if (!searchQuery) return true;
    const term = searchQuery.toLowerCase();
    const deptMatch = p.department ? p.department.toLowerCase().includes(term) : false;
    const catMatch = p.category ? p.category.toLowerCase().includes(term) : false; // fallback just in case old db records exist
    return p.name.toLowerCase().includes(term) || deptMatch || catMatch;
  });

  const departments = [...new Set(filteredProducts.map(p => p.department || p.category || 'General'))];

  return (
    <section id="products" className="products section-padding">
      <div className="container">
        <div className="text-center" style={{marginBottom: '3rem'}}>
          <h2 className="section-title">Retail & Wholesale Departments</h2>
          <p className="section-subtitle">
            Premium commercial supplies available for direct consumer purchase or bulk wholesale.
          </p>
        </div>

        {departments.map(department => (
          <div key={department} className="category-section" style={{marginBottom: '4rem'}}>
            <h3 style={{fontSize: '1.75rem', marginBottom: '1.5rem', borderBottom: '2px solid var(--color-border)', paddingBottom: '0.5rem'}}>{department}</h3>
            <div className="product-grid" style={{marginTop: '1rem'}}>
              {filteredProducts.filter(p => (p.department || p.category || 'General') === department).map(product => {
                const isWholesale = user?.role === 'wholesale';
                const activePrice = isWholesale && product.wholesalePrice ? product.wholesalePrice : product.price;
                const activeDiscount = isWholesale ? (product.wholesaleDiscount || 0) : (product.retailDiscount || product.discount || 0);

                return (
                <div key={product.id} className="product-card" onClick={() => setSelectedProduct(product)} style={{cursor: 'pointer'}}>
                  <div className="product-image-container">
                    {activeDiscount > 0 && <div className="product-discount-tag">-{activeDiscount}% OFF</div>}
                    <img src={product.image} alt={product.name} className="product-image" loading="lazy" />
                  </div>
                  <div className="product-info">
                    <h3 className="product-title">{product.name}</h3>
                    {product.section && <small style={{display: 'block', color: '#64748b', marginBottom: '0.5rem'}}>{product.section}</small>}
                    
                    {/* Mock Amazon Rating Stars */}
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.5rem', color: '#fbbf24'}}>
                      <span>★★★★★</span>
                      <span style={{fontSize: '0.8rem', color: 'var(--color-text-muted)'}}>(128)</span>
                    </div>

                    <p className="product-desc">{product.description}</p>
                    <p style={{fontSize: '0.85rem', color: product.stock > 10 ? '#10b981' : '#ef4444', fontWeight: 'bold'}}>
                      {product.stock > 10 ? 'In Stock - Ready to Ship' : `Only ${product.stock} left in stock`}
                    </p>
                    
                    <div className="product-bottom">
                      <div className="product-price">
                        {user?.role === 'wholesale' && (
                          <span style={{fontSize: '0.7rem', color: '#16a34a', display: 'block', marginBottom: '0.2rem'}}>Wholesale Active</span>
                        )}
                        {activeDiscount > 0 && (
                          <span className="price-original">{formatPrice(activePrice)}</span>
                        )}
                        {formatPrice(activePrice, activeDiscount)}
                      </div>
                      <button 
                        className="btn btn-outline"
                        style={{padding: '0.5rem 1rem'}}
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProduct(product);
                        }}
                      >
                        Select Options
                      </button>
                    </div>
                  </div>
                </div>
              )})}
            </div>
          </div>
        ))}
      </div>

      {selectedProduct && (
        <ProductModal 
            product={selectedProduct} 
            onClose={() => setSelectedProduct(null)} 
        />
      )}
    </section>
  );
};

export default ProductList;
