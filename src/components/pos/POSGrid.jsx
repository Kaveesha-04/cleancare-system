import React, { useState, useEffect } from 'react';
import { CurrencyContext } from '../../context/CurrencyContext';
import { API_BASE_URL } from '../../config';

const POSGrid = ({ products, loading, onProductClick, onScanClick }) => {
  const { formatPrice } = React.useContext(CurrencyContext);
  const [activeDepartment, setActiveDepartment] = useState('All items');
  const [activeSection, setActiveSection] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [dbDepartments, setDbDepartments] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/departments`)
      .then(res => res.json())
      .then(data => setDbDepartments(data))
      .catch(err => console.error("Failed to fetch departments for POS", err));
  }, []);

  if (loading) {
    return <div className="pos-grid-loading">Loading items...</div>;
  }

  // Filter products based on exact department and section
  const filteredProducts = products.filter(product => {
    const prodDept = product.department || product.category || 'General';
    const prodSection = product.section || 'General';
    
    const matchesDepartment = activeDepartment === 'All items' || prodDept === activeDepartment;
    const matchesSection = activeSection === 'All' || prodSection === activeSection;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesDepartment && matchesSection && matchesSearch;
  });

  const handleDepartmentClick = (deptName) => {
    setActiveDepartment(deptName);
    setActiveSection('All'); // Reset section when changing top level
  };

  const currentDeptObj = dbDepartments.find(d => d.name === activeDepartment);

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
      <div className="pos-toolbar" style={{flexDirection: 'column', paddingBottom: currentDeptObj?.sections?.length > 0 ? '0' : '0.5rem'}}>
        <div style={{display: 'flex', width: '100%', gap: '1rem', alignItems: 'center'}}>
          <div className="pos-search-wrapper" style={{marginBottom: 0, flexShrink: 0}}>
             <button onClick={onScanClick} style={{background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', padding: '0.75rem 1rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', justifyContent: 'center'}}>
               📷 Camera Scan
             </button>
          </div>
          <div className="pos-search-wrapper" style={{marginBottom: 0, flex: 1}}>
            <input 
              type="text" 
              placeholder="Search items..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pos-search-input"
            />
          </div>
          <div className="pos-categories-scroll">
            <button 
                className={`pos-category-pill ${activeDepartment === 'All items' ? 'active' : ''}`}
                onClick={() => handleDepartmentClick('All items')}
            >
                All items
            </button>
            {dbDepartments.map(dept => (
              <button 
                key={dept.id || dept.name} 
                className={`pos-category-pill ${activeDepartment === dept.name ? 'active' : ''}`}
                onClick={() => handleDepartmentClick(dept.name)}
              >
                {dept.name}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Secondary Row for Sections */}
        {currentDeptObj && currentDeptObj.sections && currentDeptObj.sections.length > 0 && (
          <div className="pos-categories-scroll" style={{marginTop: '0.5rem', paddingBottom: '0.5rem', borderTop: '1px dashed var(--color-border)', paddingTop: '0.5rem'}}>
            <button 
                className={`pos-category-pill ${activeSection === 'All' ? 'active' : ''}`}
                onClick={() => setActiveSection('All')}
                style={{fontSize: '0.8rem', padding: '0.3rem 0.8rem'}}
            >
                All {activeDepartment}
            </button>
            {currentDeptObj.sections.map(section => (
               <button 
                  key={section} 
                  className={`pos-category-pill ${activeSection === section ? 'active' : ''}`}
                  onClick={() => setActiveSection(section)}
                  style={{fontSize: '0.8rem', padding: '0.3rem 0.8rem'}}
                >
                  {section}
                </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid of Items */}
      <div className="pos-product-grid">
        {filteredProducts.map(product => {
            const bgColor = getColorFromName(product.name);
            const shortName = product.name.length > 20 ? product.name.substring(0, 18) + '...' : product.name;
            const initials = product.name.substring(0, 2).toUpperCase();

            return (
              <div 
                key={product.id || product._id || product.barcode || product.name} 
                className="pos-product-square"
                onClick={() => onProductClick(product)}
              >
                {product.image && !product.image.includes('source.unsplash.com') ? (
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
                No items found in this section.
            </div>
        )}
      </div>
    </div>
  );
};

export default POSGrid;
