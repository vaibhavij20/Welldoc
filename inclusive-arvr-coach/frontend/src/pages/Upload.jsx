import React, { useCallback, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText } from 'lucide-react';

export default function UploadPage(){
  const [recent, setRecent] = useState(() => {
    const saved = localStorage.getItem('recentUploads');
    return saved ? JSON.parse(saved) : [];
  });

  const onDrop = useCallback((acceptedFiles) => {
    const newItems = acceptedFiles.map(f => ({
      name: f.name,
      size: f.size,
      type: f.type || 'application/octet-stream',
      at: new Date().toISOString()
    }));
    const next = [...newItems, ...recent].slice(0, 10);
    setRecent(next);
    localStorage.setItem('recentUploads', JSON.stringify(next));
  }, [recent]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/csv': ['.csv'],
      'application/json': ['.json']
    }
  });

  const boxStyle = useMemo(() => ({
    border: '2px dashed #94a3b8',
    borderRadius: 12,
    padding: 32,
    textAlign: 'center',
    background: isDragActive ? '#ecfeff' : '#fff',
    transition: 'background 0.2s ease',
    cursor: 'pointer'
  }), [isDragActive]);

  return (
    <div className="container" style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <h1 style={{fontSize:24,marginBottom:16}}>Upload Report</h1>
      <div {...getRootProps({ style: boxStyle })} aria-label="Upload medical report">
        <input {...getInputProps()} />
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:12}}>
          <div style={{width:56,height:56,borderRadius:'50%',display:'grid',placeItems:'center',background:'linear-gradient(135deg,#38bdf8,#10b981)'}}>
            <Upload color="#fff" size={26} />
          </div>
          <p style={{margin:0,color:'#111827',fontWeight:600}}>Upload your medical report (PDF, CSV, JSON)</p>
          <p style={{margin:0,color:'#6b7280',fontSize:14}}>Drag and drop or click to select files</p>
        </div>
      </div>

      <div style={{marginTop:24}}>
        <h2 style={{fontSize:18,marginBottom:12}}>Recent uploads</h2>
        {recent.length === 0 ? (
          <p style={{color:'#6b7280'}}>No uploads yet.</p>
        ) : (
          <ul style={{listStyle:'none',padding:0,margin:0,display:'grid',gap:8}}>
            {recent.map((r, idx) => (
              <li key={idx} style={{display:'flex',alignItems:'center',gap:12,background:'#fff',border:'1px solid #e5e7eb',borderRadius:10,padding:'10px 12px'}}>
                <div style={{width:36,height:36,borderRadius:8,display:'grid',placeItems:'center',background:'#eff6ff'}}>
                  <FileText size={18} color="#2563eb" />
                </div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:600,color:'#111827'}}>{r.name}</div>
                  <div style={{fontSize:12,color:'#6b7280'}}>{new Date(r.at).toLocaleString()}</div>
                </div>
                <div style={{fontSize:12,color:'#6b7280'}}>{Math.round(r.size/1024)} KB</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}


