import React, { useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
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
  
  // Extract search query dynamically using React Router
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
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
    // Listen for real-time inventory adjustments across ALL tabs
    const channel = new BroadcastChannel('inventory_sync');
    channel.onmessage = (event) => {
      if (event.data === 'update') {
        fetchProducts();
      }
    };
    return () => {
      channel.close();
    };
  }, []);

  const filteredProducts = products.filter(p => {
    if (!searchQuery) return true;
    const searchWords = searchQuery.toLowerCase().split(/\s+/).filter(w => w.length > 0);
    
    return searchWords.every(term => {
      const deptMatch = p.department ? p.department.toLowerCase().includes(term) : false;
      const sectionMatch = p.section ? p.section.toLowerCase().includes(term) : false;
      const catMatch = p.category ? p.category.toLowerCase().includes(term) : false;
      return p.name.toLowerCase().includes(term) || deptMatch || sectionMatch || catMatch;
    });
  });

  const departments = [...new Set(filteredProducts.map(p => p.department || p.category || 'General'))];

  if (loading) return <div className="section-padding text-center">Loading Products...</div>;
  if (error) return <div className="section-padding text-center" style={{color: 'red'}}>Error: {error}</div>;


  return (
    <section id="products" className="products section-padding">
      <div className="container">
        <div className="text-center" style={{marginBottom: '3rem'}}>
          <h2 className="section-title">Retail & Wholesale Departments</h2>
          <p className="section-subtitle">
            Premium commercial supplies available for direct consumer purchase or bulk wholesale.
          </p>
        </div>

        {departments.map(department => {
          const deptProducts = filteredProducts.filter(p => (p.department || p.category || 'General') === department);
          const sections = [...new Set(deptProducts.map(p => p.section || 'General'))];
          
          return (
          <div key={department} className="category-section" style={{marginBottom: '4rem'}}>
            <h3 style={{fontSize: '1.75rem', marginBottom: '1.5rem', borderBottom: '2px solid var(--color-border)', paddingBottom: '0.5rem'}}>{department}</h3>
            
            {sections.map(section => (
              <div key={section} style={{marginBottom: '2rem'}}>
                {section !== 'General' && <h4 style={{fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--color-primary)'}}>{section}</h4>}
                <div className="product-grid" style={{marginTop: '1rem'}}>
                  {deptProducts.filter(p => (p.section || 'General') === section).map(product => {
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

                        <p className="product-desc">{product.description}</p>
                        <p style={{fontSize: '0.85rem', color: product.stock > 10 ? '#10b981' : '#ef4444', fontWeight: 'bold'}}>
                          {product.stock > 10 ? 'In Stock - Ready to Ship' : `Only ${product.stock} left in stock`}
                        </p>
                        
                        <div className="product-bottom">
                          <div className="product-price">
                            {!user && product.wholesalePrice ? (
                              <div style={{display: 'flex', flexDirection: 'column', gap: '0.2rem'}}>
                                <div style={{fontSize: '0.85rem', color: 'var(--color-text-muted)', textDecoration: 'line-through'}}>
                                  Retail: {formatPrice(product.price, product.retailDiscount)}
                                </div>
                                <div style={{color: '#16a34a', fontWeight: 'bold', fontSize: '1.2rem'}}>
                                  {formatPrice(product.wholesalePrice, product.wholesaleDiscount)} <span style={{fontSize: '0.7rem'}}>Wholesale</span>
                                </div>
                                <div style={{fontSize: '0.7rem', color: '#ef4444', fontWeight: 'bold'}}>Login to unlock bulk rate</div>
                              </div>
                            ) : (
                              <>
                                {user?.role === 'wholesale' && (
                                  <span style={{fontSize: '0.7rem', color: '#16a34a', display: 'block', marginBottom: '0.2rem'}}>Wholesale Active</span>
                                )}
                                {activeDiscount > 0 && (
                                  <span className="price-original">{formatPrice(activePrice)}</span>
                                )}
                                {formatPrice(activePrice, activeDiscount)}
                              </>
                            )}
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
        )})}
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
