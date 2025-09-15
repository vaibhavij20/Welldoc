import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';

export default function NavBar(){
  const nav = useNavigate();
  const { user, logout } = useAuth();

  return (
    <nav className="container navbar" aria-label="Main navigation">
      <div className="logo"><Link to="/dashboard" aria-label="AccessX Home">AccessX</Link></div>
      <div style={{display:'flex',gap:12,alignItems:'center'}}>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/get-started">Get Started</Link>

        {!user ? (
          <Link to="/auth">Sign In</Link>
        ) : (
          <>
            <button aria-label="Profile" onClick={()=>nav('/profile')} style={{background:'none',border:'none',cursor:'pointer'}}>👤</button>
            <button onClick={() => { logout(); nav('/auth'); }} style={{background:'none',border:'1px solid #ccc',borderRadius:6,padding:'4px 8px'}}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}
