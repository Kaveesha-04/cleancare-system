import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import './Login.css';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  
  // Registration Intercept State
  const [needsRegistration, setNeedsRegistration] = useState(false);
  const [googleData, setGoogleData] = useState(null);
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('customer');

  const { login, processGoogleAuth, register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const role = await login(identifier, password);
      // Auto redirect based on role (admins go to POS behind the scenes)
      if (role === 'admin') navigate('/admin/pos');
      else navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const result = await processGoogleAuth(credentialResponse.credential);
      if (result.action === 'LOGIN_SUCCESS') {
        if (result.user.role === 'admin') navigate('/admin/pos');
        else navigate('/');
      } else if (result.action === 'REQUIRES_REGISTRATION') {
        setGoogleData(result.googleData);
        setNeedsRegistration(true);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleInterceptSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await register(username, googleData.email, 'google_secure_oauth_stub', googleData.name, phone, role);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container" style={{backgroundColor: 'var(--color-bg-page)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div className="login-card" style={{background: 'var(--color-bg-card)', padding: '3rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', maxWidth: '450px', width: '100%', border: '1px solid var(--color-border)'}}>
        <div style={{textAlign: 'center', marginBottom: '2rem'}}>
            <h2 style={{color: 'var(--color-primary)', fontSize: '2rem', marginBottom: '0.5rem', fontFamily: "'Outfit', sans-serif"}}>Sign-In</h2>
            <p style={{color: 'var(--color-text-muted)'}}>Access your CleanCare Wholesale Account.</p>
        </div>
        
        {error && <div className="login-error" style={{color: 'white', background: '#ef4444', padding: '0.75rem', borderRadius: '4px', textAlign: 'center', marginBottom: '1rem'}}>{error}</div>}
        
        {needsRegistration ? (
          <form onSubmit={handleInterceptSubmit} className="login-form">
            <div style={{background: '#f0fdf4', border: '1px solid #16a34a', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center'}}>
              <h3 style={{color: '#16a34a', marginBottom: '0.5rem', fontSize: '1.1rem'}}>Google Identity Verified! ✓</h3>
              <p style={{fontSize: '0.85rem', color: '#15803d'}}>Please complete your profile configuration.</p>
            </div>

            <div className="form-group" style={{marginBottom: '1rem'}}>
              <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: 'var(--color-text-main)'}}>Unique Username</label>
              <input type="text" required value={username} onChange={e => setUsername(e.target.value)} placeholder="e.g. cleanbiz24" style={{width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '4px', fontSize: '1rem'}} />
            </div>

            <div className="form-group" style={{marginBottom: '1rem'}}>
              <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: 'var(--color-text-main)'}}>Mobile Phone Number</label>
              <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. 077 123 4567" style={{width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '4px', fontSize: '1rem'}} />
            </div>

            <div className="form-group" style={{marginBottom: '1.5rem'}}>
              <label style={{display: 'block', marginBottom: '0.75rem', fontWeight: 'bold', color: 'var(--color-text-main)'}}>Account Type</label>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                <label style={{border: `2px solid ${role === 'customer' ? 'var(--color-primary)' : 'var(--color-border)'}`, background: role === 'customer' ? '#eff6ff' : 'white', padding: '0.75rem', borderRadius: '8px', cursor: 'pointer', textAlign: 'center'}}>
                  <input type="radio" value="customer" checked={role === 'customer'} onChange={() => setRole('customer')} style={{display: 'none'}} />
                  <div style={{fontWeight: 'bold', color: 'var(--color-primary)'}}>Retail</div>
                </label>
                <label style={{border: `2px solid ${role === 'wholesale' ? '#16a34a' : 'var(--color-border)'}`, background: role === 'wholesale' ? '#f0fdf4' : 'white', padding: '0.75rem', borderRadius: '8px', cursor: 'pointer', textAlign: 'center'}}>
                  <input type="radio" value="wholesale" checked={role === 'wholesale'} onChange={() => setRole('wholesale')} style={{display: 'none'}} />
                  <div style={{fontWeight: 'bold', color: '#16a34a'}}>Wholesale</div>
                </label>
              </div>
            </div>

            <button type="submit" style={{width: '100%', padding: '1rem', background: 'var(--color-accent)', color: '#111827', border: 'none', borderRadius: '4px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer'}}>Finalize Registration</button>
          </form>
        ) : (
          <>
            <form onSubmit={handleLogin} className="login-form">
              <div className="form-group" style={{marginBottom: '1.5rem'}}>
                <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: 'var(--color-text-main)'}}>Email or Username</label>
                <input 
                  type="text" 
                  required
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  placeholder="Enter your email or username"
                  style={{width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '4px', fontSize: '1rem', outline: 'none'}}
                />
              </div>
              <div className="form-group" style={{marginBottom: '2rem'}}>
                <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: 'var(--color-text-main)'}}>Password</label>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  style={{width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '4px', fontSize: '1rem', outline: 'none'}}
                />
              </div>
              <button type="submit" style={{width: '100%', padding: '1rem', background: 'var(--color-accent)', color: '#111827', border: 'none', borderRadius: '4px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', marginBottom: '1.5rem'}}>Continue</button>
            </form>

            <div className="google-divider" style={{textAlign: 'center', margin: '1rem 0', position: 'relative'}}>
              <span style={{background: 'var(--color-bg-card)', padding: '0 10px', color: 'var(--color-text-muted)', fontSize: '0.9rem', position: 'relative', zIndex: 1}}>OR</span>
              <div style={{position: 'absolute', top: '50%', left: 0, right: 0, borderTop: '1px solid var(--color-border)', zIndex: 0}}></div>
            </div>

            <div style={{display: 'flex', justifyContent: 'center', marginTop: '1rem'}}>
              {/* <GoogleLogin 
                onSuccess={handleGoogleSuccess} 
                onError={() => setError('Google Login Failed')} 
              /> */}
            </div>

            <div style={{marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem'}}>
                <p style={{color: 'var(--color-text-muted)', marginBottom: '0.5rem'}}>New to CleanCare Supply?</p>
                <button onClick={() => navigate('/register')} style={{width: '100%', padding: '0.75rem', background: 'var(--color-bg-page)', border: '1px solid var(--color-border)', color: 'var(--color-text-main)', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'}}>Create your business account</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
