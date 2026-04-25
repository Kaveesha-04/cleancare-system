import React, { useContext } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './AdminLayout.css';

const AdminLayout = () => {
  const { logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <div className="admin-layout-wrapper">
      <div className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h2>CleanCare OS</h2>
          <p>Enterprise Control Panel</p>
        </div>
        
        <nav className="admin-nav">
          <a 
            href="/admin/dashboard" 
            className={`admin-nav-link ${location.pathname === '/admin/dashboard' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); navigate('/admin/dashboard'); }}
          >
            📊 Financial Dashboard
          </a>
          <a 
            href="/admin/inventory" 
            className={`admin-nav-link ${location.pathname === '/admin/inventory' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); navigate('/admin/inventory'); }}
          >
            📦 Global Inventory
          </a>
          <a 
            href="/admin/pos" 
            className={`admin-nav-link ${location.pathname === '/admin/pos' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); navigate('/admin/pos'); }}
          >
             💳 Retail POS Terminal
          </a>
        </nav>

        <div className="admin-footer">
          <button className="admin-exit-btn" onClick={handleLogout}>
            Power Off / Secure Exit
          </button>
        </div>
      </div>

      <div className="admin-content-area">
        {/* Child routes inject here */}
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
