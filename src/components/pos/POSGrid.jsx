import React, { useState } from 'react';
import { CurrencyContext } from '../../context/CurrencyContext';

const POSGrid = ({ products, loading, onProductClick }) => {
  const { formatPrice } = React.useContext(CurrencyContext);
  const [activeCategory, setActiveCategory] = useState('All items');
  const [searchQuery, setSearchQuery] = useState('');

  if (loading) {
    return <div className="pos-grid-loading">Loading items...</div>;
  }

  // Get unique departments for pills
  const departments = ['All items', ...new Set(products.map(p => p.department || p.category || 'General'))];

  // Filter products based on search and department
  const filteredProducts = products.filter(product => {
    const prodDept = product.department || product.category || 'General';
    const matchesDepartment = activeCategory === 'All items' || prodDept === activeCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDepartment && matchesSearch;
  });

  // Helper to generate a background color based on name string for missing images
  const getColorFromName = (name) => {
    const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="pos-grid-container">
      {/* Search and Categories Toolbar */}
      <div className="pos-toolbar">
        <div className="pos-search-wrapper">
          <input 
            type="text" 
            placeholder="Search items..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pos-search-input"
          />
        </div>
        <div className="pos-categories-scroll">
          {departments.map(dept => (
            <button 
              key={dept} 
              className={`pos-category-pill ${activeCategory === dept ? 'active' : ''}`}
              onClick={() => setActiveCategory(dept)}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Items */}
      <div className="pos-product-grid">
        {filteredProducts.map(product => {
            const bgColor = getColorFromName(product.name);
            const shortName = product.name.length > 20 ? product.name.substring(0, 18) + '...' : product.name;
            const initials = product.name.substring(0, 2).toUpperCase();

            return (
              <div 
                key={product.id} 
                className="pos-product-square"
                onClick={() => onProductClick(product)}
              >
                {product.image ? (
                  <div className="pos-product-img-wrapper">
                     <img src={product.image} alt={product.name} />
                  </div>
                ) : (
                  <div className="pos-product-colorbox" style={{backgroundColor: bgColor}}>
                    <span>{initials}</span>
                  </div>
                )}
                
                <div className="pos-product-details">
                  <span className="pos-product-title">{shortName}</span>
                  <span className="pos-product-price">{formatPrice(product.price)}</span>
                  {product.stock <= 0 && <div className="pos-out-of-stock">Out of Stock</div>}
                </div>
              </div>
            );
        })}
        {filteredProducts.length === 0 && (
            <div className="pos-no-items">
                No items found.
            </div>
        )}
      </div>
    </div>
  );
};

export default POSGrid;
