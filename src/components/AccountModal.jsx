import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import './AccountModal.css';

const AccountModal = ({ onClose }) => {
  const { user, login } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState({ loading: false, success: false, error: null });

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: null });
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, phone })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');
      
      setStatus({ loading: false, success: true, error: null });
      // Update global context by re-logging in with new details locally
      if (data.user) {
        login(token, data.user);
      }
      setTimeout(() => {
        setStatus(prev => ({...prev, success: false}));
      }, 3000);
    } catch (err) {
      setStatus({ loading: false, success: false, error: err.message });
    }
  };

  if (!user) return null;

  return (
    <div className="account-overlay" onClick={(e) => e.target.className === 'account-overlay' && onClose()}>
      <div className="account-content">
        <div className="account-header">
          <h2>My Account</h2>
          <button className="account-close" onClick={onClose}>&times;</button>
        </div>
        
        <div className="account-body">
          <p className="account-subtitle">Manage your personal information.</p>
          
          {status.success && <div className="account-success">Profile updated successfully!</div>}
          {status.error && <div className="account-error">{status.error}</div>}
          
          <form onSubmit={handleSubmit} className="account-form">
            <div className="form-group">
              <label>Username <span className="locked-badge">LOCKED</span></label>
              <input type="text" value={user.username || ''} disabled className="input-locked" />
              <small>Your username cannot be changed.</small>
            </div>
            
            <div className="form-group">
              <label>Email Address <span className="locked-badge">LOCKED</span></label>
              <input type="email" value={user.email || ''} disabled className="input-locked" />
              <small>Your login email is a permanent identifier.</small>
            </div>

            <div className="form-divider"></div>

            <div className="form-group">
              <label>Full Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input 
                type="tel" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                placeholder="e.g. +94..."
              />
            </div>

            <div className="account-actions">
              <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={status.loading}>
                {status.loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AccountModal;
