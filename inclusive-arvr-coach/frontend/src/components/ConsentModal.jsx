
import React, { useState } from 'react'
import { sendConsent } from '../lib/api'

export default function ConsentModal({ onClose, userId='anon' }) {
  const [consent, setConsent] = useState({ microphone: false, camera: false, dataSharing: false });

  const handleSubmit = async () => {
    // store locally
    localStorage.setItem('iac_consent', JSON.stringify(consent));
    // send to backend
    await sendConsent({ userId, consent, timestamp: new Date().toISOString() });
    onClose();
  };

  return (
    <div style={{position:'fixed',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.5)'}}>
      <div style={{background:'#fff',padding:20,borderRadius:12,maxWidth:440,width:'90%'}}>
        <h3>Permissions & Data</h3>
        <p>We ask for permission to use your microphone/camera for captions and accessibility features. You can change these later.</p>
        <label><input type="checkbox" checked={consent.microphone} onChange={e=>setConsent({...consent,microphone:e.target.checked})} /> Microphone (captions)</label><br/>
        <label><input type="checkbox" checked={consent.camera} onChange={e=>setConsent({...consent,camera:e.target.checked})} /> Camera (eye-tracking)</label><br/>
        <label><input type="checkbox" checked={consent.dataSharing} onChange={e=>setConsent({...consent,dataSharing:e.target.checked})} /> Share anonymized usage data</label>
        <div style={{marginTop:12,display:'flex',gap:8}}>
          <button className="btn" onClick={handleSubmit}>I Agree</button>
          <button className="btn secondary" onClick={() => onClose()}>Not now</button>
        </div>
      </div>
    </div>
  )
}

