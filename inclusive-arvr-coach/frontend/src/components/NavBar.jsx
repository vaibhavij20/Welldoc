import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import SettingsModal from './SettingsModal';

export default function NavBar(){
  const nav = useNavigate();
  const loc = useLocation();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const isActive = (path) => loc.pathname === path;

  return (
    <nav className="container navbar" aria-label="Main navigation" style={{display:'flex',alignItems:'center',padding:'12px 0'}}>
      <div style={{display:'flex',alignItems:'center',gap:10}}>
        <Link to="/dashboard" aria-label="Wellyou Home" style={{display:'flex',alignItems:'center',gap:8,textDecoration:'none'}}>
          <span className="brand-logo" aria-hidden style={{width:28,height:28,display:'inline-block',borderRadius:'50%',background:'linear-gradient(135deg, #22d3ee, #22c55e)', boxShadow:'0 2px 6px rgba(0,0,0,0.15)'}} />
          <span style={{fontWeight:700,fontSize:18,color:'#111827'}}>Wellyou Coach</span>
        </Link>
      </div>

      <div style={{flex:1,display:'flex',justifyContent:'center'}}>
        <div role="tablist" aria-label="Dashboard sections" style={{display:'flex',gap:16,alignItems:'center'}}>
          <Link to={{ pathname: '/dashboard', hash: '#overview' }} role="tab" aria-selected={loc.pathname.startsWith('/dashboard')} style={{color:'#374151', textDecoration:'none',fontWeight:500}}>Overview</Link>
          <Link to={{ pathname: '/dashboard', hash: '#metrics' }} role="tab" aria-selected={false} style={{color:'#374151', textDecoration:'none',fontWeight:500}}>Metrics</Link>
          <Link to={{ pathname: '/dashboard', hash: '#assessment' }} role="tab" aria-selected={false} style={{color:'#374151', textDecoration:'none',fontWeight:500}}>Assessment</Link>
          <Link to={{ pathname: '/dashboard', hash: '#reports' }} role="tab" aria-selected={false} style={{color:'#374151', textDecoration:'none',fontWeight:500}}>Reports</Link>
        </div>
      </div>

      <div style={{display:'flex',gap:12,alignItems:'center'}}>
        <Link to="/upload" aria-label="Upload Report" style={{textDecoration:'none'}}>
          <button className="btn primary" style={{height:40}}>Upload Report</button>
        </Link>
        {!user ? (
          <Link to="/auth">Sign In</Link>
        ) : (
          <div style={{position:'relative'}}>
            <button aria-label="Profile menu" onClick={()=>setOpen(v=>!v)} style={{background:'none',border:'none',cursor:'pointer',fontSize:20}}>👤</button>
            {open && (
              <div role="menu" aria-label="Profile" style={{position:'absolute',right:0,top:'120%',background:'#fff',border:'1px solid #e5e7eb',borderRadius:8,boxShadow:'0 8px 24px rgba(0,0,0,0.08)',minWidth:180,zIndex:50}}>
                <button role="menuitem" onClick={()=>{ setOpen(false); setShowSettings(true); }} style={{display:'block',width:'100%',textAlign:'left',padding:10,background:'none',border:'none',cursor:'pointer'}}>Settings</button>
                <button role="menuitem" onClick={()=>{ setOpen(false); nav('/profile'); }} style={{display:'block',width:'100%',textAlign:'left',padding:10,background:'none',border:'none',cursor:'pointer'}}>Profile</button>
                <button role="menuitem" onClick={()=>{ setOpen(false); logout(); nav('/auth'); }} style={{display:'block',width:'100%',textAlign:'left',padding:10,background:'none',border:'none',cursor:'pointer'}}>Logout</button>
              </div>
            )}
          </div>
        )}
      </div>
      <SettingsModal open={showSettings} onClose={()=>setShowSettings(false)} />
    </nav>
  );
}
