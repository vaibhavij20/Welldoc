import React, { useState } from 'react';

export default function WellyouAssistant(){
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I\'m Wellyou. How can I help with your health today?' }
  ]);

  const send = () => {
    if (!input.trim()) return;
    const next = [...messages, { role: 'user', content: input.trim() }, { role: 'assistant', content: 'Thanks! I\'ll analyze that soon. (Demo response)' }];
    setMessages(next);
    setInput('');
  };

  return (
    <div>
      {(
        <div role="dialog" aria-label="Wellyou assistant" style={{position:'fixed',right:0,top:0,height:'100vh',width:open?360:0,background:'#fff',borderLeft:'1px solid #e5e7eb',boxShadow: open ? '0 12px 32px rgba(0,0,0,0.18)' : 'none',display:'flex',flexDirection:'column',overflow:'hidden',zIndex:60,transition:'width 0.25s ease'}}>
          <div style={{display:'flex',alignItems:'center',gap:8,padding:'10px 12px',borderBottom:'1px solid #eef2f7'}}>
            <span aria-hidden style={{width:24,height:24,display:'inline-block',borderRadius:'50%',background:'linear-gradient(135deg,#22d3ee,#22c55e)'}} />
            <strong>Wellyou Assistant</strong>
            <button onClick={()=>setOpen(false)} aria-label="Close" style={{marginLeft:'auto',background:'none',border:'none',cursor:'pointer'}}>✕</button>
          </div>
          <div style={{flex:1,padding:12,overflowY:'auto',display:'grid',gap:8}}>
            {messages.map((m, idx) => (
              <div key={idx} style={{justifySelf: m.role==='user' ? 'end' : 'start', maxWidth: 240, padding:'8px 10px', borderRadius:10, background: m.role==='user' ? '#e0f2fe' : '#f1f5f9', color:'#0f172a'}}>
                {m.content}
              </div>
            ))}
          </div>
          <div style={{display:'flex',gap:8,padding:10,borderTop:'1px solid #eef2f7'}}>
            <input value={input} onChange={e=>setInput(e.target.value)} placeholder="Ask a question..." style={{flex:1,border:'1px solid #e5e7eb',borderRadius:8,padding:'8px 10px'}} onKeyDown={(e)=>{ if(e.key==='Enter'){ e.preventDefault(); send(); }}} />
            <button className="btn" onClick={send}>Send</button>
          </div>
        </div>
      )}

      <button onClick={()=>setOpen(v=>!v)} aria-label="Open Wellyou" style={{position:'fixed',right:20,bottom:20,width:56,height:56,borderRadius:'50%',border:'none',cursor:'pointer',boxShadow:'0 8px 24px rgba(0,0,0,0.18)',background:'linear-gradient(135deg,#22d3ee,#22c55e)',zIndex:50}}>
        <span aria-hidden style={{display:'inline-block',width:28,height:28,borderRadius:'50%',background:'#fff',opacity:0.9}} />
      </button>
    </div>
  );
}


