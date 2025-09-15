import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { validatePassword, validateEmail, getPasswordStrength } from '../utils/validation';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [status, setStatus] = useState('');
  const [twoFactorToken, setTwoFactorToken] = useState('');
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState([]);
  const { signup, login } = useAuth();
  const navigate = useNavigate();

  function validate() {
    if (!form.email || !form.password) {
      setStatus('Email and password are required');
      return false;
    }
    
    if (!validateEmail(form.email)) {
      setStatus('Invalid email format');
      return false;
    }
    
    if (!isLogin && !form.name) {
      setStatus('Name is required for signup');
      return false;
    }
    
    if (!isLogin) {
      const passwordValidation = validatePassword(form.password);
      if (!passwordValidation.isValid) {
        setPasswordErrors(passwordValidation.errors);
        setStatus('Password does not meet requirements');
        return false;
      }
    }
    
    if (requiresTwoFactor && !twoFactorToken) {
      setStatus('Two-factor authentication code is required');
      return false;
    }
    
    return true;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setStatus('Submitting…');
    try {
      const res = isLogin
        ? await login({ 
            email: form.email, 
            password: form.password, 
            twoFactorToken: requiresTwoFactor ? twoFactorToken : undefined 
          })
        : await signup({ name: form.name, email: form.email, password: form.password });
      
      if (res.success) {
        navigate("/get-started", { replace: true });
      } else if (res.requiresTwoFactor) {
        setRequiresTwoFactor(true);
        setStatus('Please enter your two-factor authentication code');
      } else {
        setStatus(res.error || "Auth failed");
      }
    } catch (err) {
      setStatus("Something went wrong");
    }
  }

  return (
    <div className="container">
      <div className="form">
        <h2>{isLogin ? 'Sign In' : 'Sign Up'}</h2>
        
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div>
              <label htmlFor="name">Name</label>
              <input
                id="name"
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your name"
              />
            </div>
          )}
          
          <div>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="your@email.com"
            />
          </div>
          
          <div>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => {
                setForm({ ...form, password: e.target.value });
                setPasswordErrors([]);
              }}
              placeholder="Your password"
            />
            {!isLogin && form.password && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ 
                  width: '100%', 
                  height: '4px', 
                  backgroundColor: '#e5e7eb', 
                  borderRadius: '2px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${getPasswordStrength(form.password).percentage}%`,
                    height: '100%',
                    backgroundColor: getPasswordStrength(form.password).color,
                    transition: 'all 0.3s ease'
                  }} />
                </div>
                <p style={{ 
                  fontSize: '12px', 
                  color: getPasswordStrength(form.password).color,
                  margin: '4px 0 0 0'
                }}>
                  {getPasswordStrength(form.password).label}
                </p>
              </div>
            )}
            {passwordErrors.length > 0 && (
              <div style={{ marginTop: '8px' }}>
                {passwordErrors.map((error, index) => (
                  <p key={index} style={{ color: '#dc2626', fontSize: '12px', margin: '2px 0' }}>
                    • {error}
                  </p>
                ))}
              </div>
            )}
          </div>
          
          {requiresTwoFactor && (
            <div>
              <label htmlFor="twoFactorToken">Two-Factor Authentication Code</label>
              <input
                id="twoFactorToken"
                type="text"
                value={twoFactorToken}
                onChange={(e) => setTwoFactorToken(e.target.value)}
                placeholder="Enter 6-digit code from your authenticator app"
                maxLength="6"
              />
            </div>
          )}
          
          <button type="submit" className="btn" disabled={status === 'Submitting…'}>
            {status === 'Submitting…' ? 'Submitting…' : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>
        
        {status && <p style={{ color: status.includes('required') || status.includes('failed') ? '#dc2626' : '#059669', marginTop: '12px' }}>{status}</p>}
        
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button
            type="button"
            className="btn secondary"
            onClick={() => {
              setIsLogin(!isLogin);
              setForm({ name: '', email: '', password: '' });
              setStatus('');
              setTwoFactorToken('');
              setRequiresTwoFactor(false);
              setPasswordErrors([]);
            }}
          >
            {isLogin ? 'Need an account? Sign up' : 'Have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}