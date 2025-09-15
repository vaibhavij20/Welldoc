import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function FitConnected(){
  const nav = useNavigate();
  const [msg, setMsg] = useState('Finalizing connection…');

  useEffect(() => {
    let timer;
    const poll = () => {
      fetch('/auth/google-fit/status')
        .then(r=>r.json())
        .then(s=>{
          if (s.connected) {
            setMsg('Google Fit connected. Redirecting…');
            setTimeout(()=>nav('/dashboard', { replace: true }), 800);
          } else {
            timer = setTimeout(poll, 800);
          }
        })
        .catch(()=>{ timer = setTimeout(poll, 1000); });
    };
    poll();
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="container" style={{maxWidth:720,margin:'40px auto',textAlign:'center'}}>
      <h2 style={{marginBottom:8}}>Google Fit</h2>
      <p style={{color:'#374151'}}>{msg}</p>
      <div style={{width:36,height:36,border:'3px solid #e5e7eb',borderTopColor:'#2563eb',borderRadius:'50%',margin:'18px auto',animation:'spin 1s linear infinite'}} />
      <style>{'@keyframes spin{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}'}</style>
      <p><a href="/dashboard">Go to Dashboard</a></p>
    </div>
  );
}


