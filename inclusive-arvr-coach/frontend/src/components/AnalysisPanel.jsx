import React from 'react';

export default function AnalysisPanel(){
  return (
    <div className="container" style={{maxWidth: 1200, margin:'12px auto'}}>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(260px, 1fr))',gap:12}}>
        <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:16,padding:12}}>
          <h4 style={{margin:'0 0 8px 0',color:'#1f2937'}}>Global Feature Importance</h4>
          <img src="/analysis/shap_global.png" alt="Global feature importance from SHAP" style={{width:'100%',borderRadius:12}} />
        </div>
        <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:16,padding:12}}>
          <h4 style={{margin:'0 0 8px 0',color:'#1f2937'}}>Local Explanation Example</h4>
          <img src="/analysis/shap_local_example.png" alt="Local SHAP explanation example" style={{width:'100%',borderRadius:12}} />
        </div>
      </div>
    </div>
  );
}


