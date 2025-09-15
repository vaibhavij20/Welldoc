// src/pages/GetStarted.jsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { sendEvent } from '../lib/api'
import { getUser, setUser } from '../lib/userStore'

const options = [
  {id:'hearing', label:'Hearing Disability', icon:'👂'},
  {id:'motor', label:'Motor Disability', icon:'♿'},
  {id:'social', label:'Social Disability', icon:'🧠'}
]

export default function GetStarted(){
  const nav = useNavigate()
  const choose = async (id) => {
    const user = getUser() || { email: 'anon' };
    const updatedUser = { ...user, category: id };
    setUser(updatedUser);
    // log event
    await sendEvent({
      userId: user.email || 'anon',
      sessionId: `sess-${Date.now()}`,
      eventType: 'choose_disability',
      scenario: 'onboarding',
      timestamp: new Date().toISOString(),
      details: { choice: id }
    });
    nav('/dashboard');
  };

  return (
    <div>
      <h2>Personalize your experience</h2>
      <div className="grid" role="list">
        {options.map(o=>(
          <div key={o.id} role="listitem" className="card" style={{cursor:'pointer'}} onClick={()=>choose(o.id)} aria-label={o.label}>
            <div style={{fontSize:30}}>{o.icon}</div>
            <h3>{o.label}</h3>
            <p>Personalized tasks and settings for {o.label.toLowerCase()}.</p>
            <button className="btn" onClick={()=>choose(o.id)} aria-label={`Choose ${o.label}`}>Choose</button>
          </div>
        ))}
      </div>
    </div>
  )
}
