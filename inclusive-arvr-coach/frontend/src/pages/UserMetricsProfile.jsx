import React, { useState } from 'react';
import { ChevronDown, ChevronRight, User, Pill, Activity, Leaf, MapPin } from 'lucide-react';

function Section({ title, icon: Icon, children }){
  const [open, setOpen] = useState(true);
  return (
    <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:12,overflow:'hidden'}}>
      <button onClick={()=>setOpen(v=>!v)} aria-expanded={open} style={{display:'flex',alignItems:'center',gap:10,width:'100%',padding:14,background:'none',border:'none',cursor:'pointer'}}>
        {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        <Icon size={16} />
        <span style={{fontWeight:600}}>{title}</span>
      </button>
      {open && (
        <div style={{padding:'0 16px 16px 42px'}}>
          {children}
        </div>
      )}
    </div>
  );
}

export default function UserMetricsProfile(){
  return (
    <div className="container" style={{ maxWidth: 900, margin: '0 auto', padding: 24, display:'grid', gap: 12 }}>
      <h1 style={{fontSize:24,marginBottom:8}}>User Metrics Profile</h1>
      <div style={{display:'grid',gridTemplateColumns:'1fr',gap:12}}>
        <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:12,padding:16,display:'grid',gap:8}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <User size={18} />
            <strong>Personal Information</strong>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(2, minmax(0,1fr))',gap:10}}>
            <div><small style={{color:'#6b7280'}}>Name</small><div>Jane Doe</div></div>
            <div><small style={{color:'#6b7280'}}>Age</small><div>34</div></div>
            <div><small style={{color:'#6b7280'}}>Gender</small><div>Female</div></div>
            <div style={{display:'flex',alignItems:'center',gap:6}}><MapPin size={14} color="#6b7280" /><div><small style={{color:'#6b7280'}}>Location</small><div>San Francisco, CA</div></div></div>
          </div>
        </div>

        <Section title="Medical History" icon={Pill}>
          <ul style={{margin:0,paddingLeft:16,color:'#374151'}}>
            <li>Hypertension (diagnosed 2019)</li>
            <li>Allergy: Penicillin</li>
          </ul>
        </Section>

        <Section title="Medications" icon={Pill}>
          <ul style={{margin:0,paddingLeft:16,color:'#374151'}}>
            <li>Lisinopril 10mg daily</li>
            <li>Vitamin D 1000 IU daily</li>
          </ul>
        </Section>

        <Section title="Lifestyle" icon={Leaf}>
          <ul style={{margin:0,paddingLeft:16,color:'#374151'}}>
            <li>Non-smoker, occasional alcohol</li>
            <li>Diet: Mediterranean-inspired</li>
          </ul>
        </Section>

        <Section title="Activity Data" icon={Activity}>
          <ul style={{margin:0,paddingLeft:16,color:'#374151'}}>
            <li>Average steps: 8,200/day</li>
            <li>Weekly workouts: 3</li>
          </ul>
        </Section>

        <Section title="Environmental Factors" icon={MapPin}>
          <ul style={{margin:0,paddingLeft:16,color:'#374151'}}>
            <li>Air quality: Good</li>
            <li>Noise exposure: Moderate</li>
          </ul>
        </Section>

        <Section title="Biometrics" icon={Activity}>
          <ul style={{margin:0,paddingLeft:16,color:'#374151'}}>
            <li>Height: 170 cm</li>
            <li>Weight: 68 kg</li>
            <li>BMI: 23.5</li>
            <li>Resting Heart Rate: 70 BPM</li>
          </ul>
        </Section>
      </div>
    </div>
  );
}


