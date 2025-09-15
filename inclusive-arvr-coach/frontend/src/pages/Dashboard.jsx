// src/pages/Dashboard.jsx
import React from 'react'
import AccessibleCard from '../components/AccessibleCard'
import { getUser } from '../lib/userStore'

export default function Dashboard(){
  const widgets = [
    {title:'AR Navigation',desc:'Accessible maps & routes',icon:'🧭', key:'ar'},
    {title:'VR Doctor',desc:'Therapeutic scenarios',icon:'💊', key:'vr'},
    {title:'Games',desc:'Skill-building mini-games',icon:'🎮', key:'games'},
    {title:'Voice Assistant',desc:'Hands-free commands',icon:'🎙️', key:'voice'}
  ]
  const user = getUser() || { email: 'anon' }
  return (
    <div>
      <h2>Dashboard</h2>
      <div className="grid" aria-live="polite">
        {widgets.map(w=>(
          <AccessibleCard key={w.key} title={w.title} desc={w.desc} icon={w.icon} widgetKey={w.key} userId={user.email || 'anon'} />
        ))}
      </div>
    </div>
  )
}
