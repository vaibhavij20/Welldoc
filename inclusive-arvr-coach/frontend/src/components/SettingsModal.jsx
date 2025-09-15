import React, { useState } from 'react';

export default function SettingsModal({ open, onClose }){
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [alerts, setAlerts] = useState(true);

  if (!open) return null;

  return (
    <div role="dialog" aria-modal="true" aria-label="Settings" style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.35)',display:'grid',placeItems:'center',zIndex:1000}}>
      <div style={{background:'#ffffff',border:'1px solid rgba(17,24,39,0.06)',borderRadius:16,boxShadow:'0 20px 60px rgba(17,24,39,0.18)',width:'min(92vw, 560px)'}}>
        <div style={{padding:'16px 18px',borderBottom:'1px solid rgba(17,24,39,0.06)'}}>
          <h3 style={{margin:0,fontSize:18,color:'#1f2937'}}>Settings</h3>
        </div>
        <div style={{padding:18,display:'grid',gap:12}}>
          <label style={{display:'grid',gap:6}}>
            <span style={{fontSize:13,color:'#374151'}}>Name</span>
            <input value={name} onChange={e=>setName(e.target.value)} style={{border:'1px solid #e5e7eb',borderRadius:10,padding:'10px 12px'}} />
          </label>
          <label style={{display:'grid',gap:6}}>
            <span style={{fontSize:13,color:'#374151'}}>Email</span>
            <input value={email} onChange={e=>setEmail(e.target.value)} style={{border:'1px solid #e5e7eb',borderRadius:10,padding:'10px 12px'}} />
          </label>
          <label style={{display:'flex',alignItems:'center',gap:8}}>
            <input type="checkbox" checked={alerts} onChange={e=>setAlerts(e.target.checked)} />
            <span style={{color:'#374151'}}>Enable health alerts</span>
          </label>
        </div>
        <div style={{display:'flex',justifyContent:'flex-end',gap:8,padding:16,borderTop:'1px solid rgba(17,24,39,0.06)'}}>
          <button className="btn secondary" onClick={onClose} style={{height:38}}>Cancel</button>
          <button className="btn primary" onClick={onClose} style={{height:38}}>Save</button>
        </div>
      </div>
    </div>
  );
}


