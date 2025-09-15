
import React from 'react'
import { sendEvent } from '../lib/api'

export default function AccessibleCard({ title, desc, icon, widgetKey, userId='anon' }) {
  const handleOpen = async () => {
    // log to backend
    await sendEvent({
      userId,
      sessionId: `sess-${Date.now()}`,
      eventType: 'open_widget',
      scenario: 'dashboard',
      timestamp: new Date().toISOString(),
      details: { widget: widgetKey }
    });
    alert(title + ' placeholder (will redirect in future).');
  };

  return (
    <article className="card" role="region" aria-labelledby={title}>
      <div style={{display:'flex',alignItems:'center',gap:12}}>
        <div aria-hidden="true" style={{fontSize:28}}>{icon}</div>
        <h3 id={title}>{title}</h3>
      </div>
      <p>{desc}</p>
      <div style={{marginTop:'auto'}}>
        <button className="btn" onClick={handleOpen} aria-label={`${title} open`}>Open</button>
      </div>
    </article>
  )
}
