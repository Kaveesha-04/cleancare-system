import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config';
import './CatalogModal.css';

const CatalogModal = ({ onClose }) => {
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/products`)
      .then(res => res.json())
      .then(data => {
        setCatalog(data);
        setLoading(false);
      })
      .catch(err => console.error("Catalog fetch error", err));
  }, []);

  const handleOverlayClick = (e) => {
    if (e.target.className === 'catalog-modal-overlay') {
      onClose();
    }
  };

  const departments = [...new Set(catalog.map(p => p.department || p.category || 'General'))];

  return (
    <div className="catalog-modal-overlay" onClick={handleOverlayClick}>
      <div className="catalog-modal-content">
        <div className="catalog-header">
          <h2>Complete Inventory Catalog</h2>
          <button className="catalog-close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <div className="catalog-body">
          {loading ? (
            <p className="catalog-loading">Loading master catalog...</p>
          ) : (
            departments.map(dept => {
              const deptItems = catalog.filter(p => (p.department || p.category || 'General') === dept);
              const sections = [...new Set(deptItems.map(p => p.section || 'General'))];
              
              return (
                <div key={dept} className="catalog-department">
                  <h3>{dept}</h3>
                  {sections.map(sec => (
                    <div key={sec} className="catalog-section">
                      {sec !== 'General' && <h4>{sec}</h4>}
                      <ul className="catalog-item-list">
                        {deptItems.filter(p => (p.section || 'General') === sec).map(item => (
                          <li key={item.id || item._id} className="catalog-item">
                            <span className="catalog-item-name">{item.name}</span>
                            <span className="catalog-item-sku">SKU: CCS-{(item.id || item._id || '').substring(18) || '000'}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default CatalogModal;
