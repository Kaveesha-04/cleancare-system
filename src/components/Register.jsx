import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import './Login.css'; // Reusing login styles for consistency

const Register = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('customer'); // Default to retail customer
  const [error, setError] = useState(null);
  const [googleFlow, setGoogleFlow] = useState(false);
  const [googleData, setGoogleData] = useState(null);
  const { register, processGoogleAuth } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (googleFlow && !phone) return setError("Phone number is strictly required for Identity mapping.");
    setError(null);
    try {
      await register(username, email, password, name, phone, role);
      navigate('/');
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
        setEmail(result.googleData.email);
        setName(result.googleData.name);
        setPassword('google_secure_oauth_stub'); 
        setGoogleFlow(true);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container" style={{backgroundColor: 'var(--color-bg-page)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem'}}>
      <div className="login-card" style={{background: 'var(--color-bg-card)', padding: '3rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', maxWidth: '500px', width: '100%', border: '1px solid var(--color-border)'}}>
        <div style={{textAlign: 'center', marginBottom: '2rem'}}>
            <h2 style={{color: 'var(--color-primary)', fontSize: '2rem', marginBottom: '0.5rem', fontFamily: "'Outfit', sans-serif"}}>Create Account</h2>
            <p style={{color: 'var(--color-text-muted)'}}>Join CleanCare Supply today.</p>
        </div>
        
        {error && <div className="login-error" style={{color: 'white', background: '#ef4444', padding: '0.75rem', borderRadius: '4px', textAlign: 'center', marginBottom: '1rem'}}>{error}</div>}
        
        <form onSubmit={handleRegister} className="login-form">
          {!googleFlow ? (
          <>
            <div className="form-group" style={{marginBottom: '1rem'}}>
              <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: 'var(--color-text-main)'}}>Unique Username</label>
              <input 
                type="text" 
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="e.g. cleanbiz24"
                style={{width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '4px', fontSize: '1rem', outline: 'none'}}
              />
            </div>

            <div className="form-group" style={{marginBottom: '1rem'}}>
              <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: 'var(--color-text-main)'}}>Full Name / Business Name</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. John Doe or Acme Corp"
                style={{width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '4px', fontSize: '1rem', outline: 'none'}}
              />
            </div>

            <div className="form-group" style={{marginBottom: '1rem'}}>
              <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: 'var(--color-text-main)'}}>Email Address</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email"
                style={{width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '4px', fontSize: '1rem', outline: 'none'}}
              />
            </div>

            <div className="form-group" style={{marginBottom: '1.5rem'}}>
              <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: 'var(--color-text-main)'}}>Password (min 6 chars)</label>
              <input 
                type="password" 
                required
                minLength="6"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Create a secure password"
                style={{width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '4px', fontSize: '1rem', outline: 'none'}}
              />
            </div>
            
            <div style={{display: 'flex', justifyContent: 'center', marginTop: '1rem', marginBottom: '1.5rem'}}>
              {/* <GoogleLogin 
                onSuccess={handleGoogleSuccess} 
                onError={() => setError('Google Authentication Failed')} 
                type="standard" 
                theme="outline" 
                size="large" 
                text="signup_with" 
                shape="rectangular" 
              /> */}
            </div>
          </>
          ) : (
            <div style={{background: '#f0fdf4', border: '1px solid #16a34a', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center'}}>
              <h3 style={{color: '#16a34a', marginBottom: '0.5rem'}}>Google Identity Verified! ✓</h3>
              <p style={{fontSize: '0.85rem', color: '#15803d'}}>Please complete your profile below.</p>
              <p style={{fontSize: '0.85rem', color: '#16a34a', fontWeight: 'bold', marginTop: '0.5rem'}}>{googleData?.email}</p>
            </div>
          )}

          <div className="form-group" style={{marginBottom: '1.5rem'}}>
            <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: 'var(--color-text-main)'}}>Mobile Phone Number *</label>
            <input 
              type="tel" 
              required
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="e.g. 077 123 4567"
              style={{width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '4px', fontSize: '1rem', outline: 'none'}}
            />
            <p style={{fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem'}}>Used securely as your in-store POS loyalty card ID.</p>
          </div>

          <div className="form-group" style={{marginBottom: '2rem'}}>
            <label style={{display: 'block', marginBottom: '0.75rem', fontWeight: 'bold', color: 'var(--color-text-main)'}}>Account Type</label>
            
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
              <label style={{
                border: `2px solid ${role === 'customer' ? 'var(--color-primary)' : 'var(--color-border)'}`, 
                background: role === 'customer' ? '#eff6ff' : 'white',
                padding: '1rem', borderRadius: '8px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s'
              }}>
                <input type="radio" value="customer" checked={role === 'customer'} onChange={() => setRole('customer')} style={{display: 'none'}} />
                <div style={{fontWeight: 'bold', color: 'var(--color-primary)', marginBottom: '0.25rem'}}>Retail Customer</div>
                <div style={{fontSize: '0.8rem', color: 'var(--color-text-muted)'}}>Standard Pricing</div>
              </label>

              <label style={{
                border: `2px solid ${role === 'wholesale' ? '#16a34a' : 'var(--color-border)'}`, 
                background: role === 'wholesale' ? '#f0fdf4' : 'white',
                padding: '1rem', borderRadius: '8px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s'
              }}>
                <input type="radio" value="wholesale" checked={role === 'wholesale'} onChange={() => setRole('wholesale')} style={{display: 'none'}} />
                <div style={{fontWeight: 'bold', color: '#16a34a', marginBottom: '0.25rem'}}>Wholesale Partner</div>
                <div style={{fontSize: '0.8rem', color: 'var(--color-text-muted)'}}>B2B Discount Pricing</div>
              </label>
            </div>
          </div>

          <button type="submit" style={{width: '100%', padding: '1rem', background: 'var(--color-accent)', color: '#111827', border: 'none', borderRadius: '4px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s'}}>
            Create Account
          </button>
        </form>

        <div style={{marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem'}}>
            <p style={{color: 'var(--color-text-muted)', marginBottom: '0.5rem'}}>Already have an account?</p>
            <button onClick={() => navigate('/login')} style={{width: '100%', padding: '0.75rem', background: 'transparent', border: '1px solid var(--color-primary)', color: 'var(--color-primary)', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'}}>
              Sign In Instead
            </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
