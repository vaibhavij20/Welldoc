// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Heart, Activity, FileText, Upload, BarChart3, 
  TrendingUp, Shield, Zap, Brain, Scale,
  Plus, Settings, Download, Share2
} from 'lucide-react';
import HealthDataForm from '../components/HealthDataForm';
import HealthMetrics from '../components/HealthMetrics';
import DiagonalMetricGraph from '../components/DiagonalMetricGraph';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import HealthReport from '../components/HealthReport';
import { getUser } from '../lib/userStore';

export default function Dashboard() {
  const [currentView, setCurrentView] = useState('overview');
  const [healthData, setHealthData] = useState(null);
  const [showDataForm, setShowDataForm] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('week'); // 'week' | 'month' | 'year'
  const location = useLocation();
  const [fitStatus, setFitStatus] = useState({ connected: false, hasRefreshToken: false });
  const [stepsSeries, setStepsSeries] = useState(null);
  const [calSeries, setCalSeries] = useState(null);
  const [hrSeries, setHrSeries] = useState(null);
  const [sleepDonutLive, setSleepDonutLive] = useState(null);
  
  const user = getUser() || { email: 'anon' };

  // Simulate loading health data
  useEffect(() => {
    const savedData = localStorage.getItem('healthData');
    if (savedData) {
      setHealthData(JSON.parse(savedData));
    }
    // Load Google Fit status on mount
    fetch('/auth/google-fit/status').then(r=>r.json()).then(setFitStatus).catch(()=>{});
  }, []);

  const handleDataSubmit = (data) => {
    setIsLoading(true);
    // Simulate processing time
    setTimeout(() => {
      setHealthData(data);
      localStorage.setItem('healthData', JSON.stringify(data));
      setShowDataForm(false);
      setIsLoading(false);
      setCurrentView('metrics');
    }, 2000);
  };

  const handleGenerateReport = () => {
    setShowReport(true);
  };

  const bpData = [
    { day: 'Mon', systolic: 120, diastolic: 78 },
    { day: 'Tue', systolic: 122, diastolic: 80 },
    { day: 'Wed', systolic: 118, diastolic: 77 },
    { day: 'Thu', systolic: 126, diastolic: 82 },
    { day: 'Fri', systolic: 121, diastolic: 79 },
    { day: 'Sat', systolic: 124, diastolic: 81 },
    { day: 'Sun', systolic: 119, diastolic: 76 },
  ];

  const caloriesData = [
    { day: 'Mon', intake: 2100, burn: 1900 },
    { day: 'Tue', intake: 2000, burn: 2050 },
    { day: 'Wed', intake: 2300, burn: 2200 },
    { day: 'Thu', intake: 1950, burn: 2000 },
    { day: 'Fri', intake: 2500, burn: 2300 },
    { day: 'Sat', intake: 2600, burn: 2400 },
    { day: 'Sun', intake: 2000, burn: 1800 },
  ];

  const heartBmiData = [
    { day: 'Mon', hr: 72, bmi: 23.4 },
    { day: 'Tue', hr: 74, bmi: 23.4 },
    { day: 'Wed', hr: 71, bmi: 23.5 },
    { day: 'Thu', hr: 75, bmi: 23.5 },
    { day: 'Fri', hr: 70, bmi: 23.5 },
    { day: 'Sat', hr: 69, bmi: 23.6 },
    { day: 'Sun', hr: 73, bmi: 23.6 },
  ];

  const sleepDonut = [
    { name: 'Deep', value: 20 },
    { name: 'Light', value: 55 },
    { name: 'REM', value: 25 },
  ];

  const activityData = [
    { day: 'Mon', steps: 6000, calories: 220 },
    { day: 'Tue', steps: 7200, calories: 260 },
    { day: 'Wed', steps: 8400, calories: 300 },
    { day: 'Thu', steps: 9300, calories: 320 },
    { day: 'Fri', steps: 10000, calories: 340 },
    { day: 'Sat', steps: 12000, calories: 420 },
    { day: 'Sun', steps: 5000, calories: 180 },
  ];

  const labRadar = [
    { metric: 'Glucose', value: 80 },
    { metric: 'LDL', value: 65 },
    { metric: 'HDL', value: 55 },
    { metric: 'Triglycerides', value: 70 },
    { metric: 'A1C', value: 75 },
  ];
  const donutColors = ['#0284c7', '#22c55e', '#8b5cf6'];

  // Simple time-range filter demo (uses the same base arrays for now)
  const filterData = (arr) => {
    if (timeRange === 'week') return arr;
    if (timeRange === 'month') return [...arr, ...arr, ...arr, ...arr].slice(0, 28);
    return [...arr, ...arr, ...arr, ...arr, ...arr, ...arr, ...arr].slice(0, 52);
  };

  // Scroll to hash sections when the URL hash changes
  useEffect(() => {
    const hash = location.hash?.replace('#','');
    if (!hash) return;
    const el = document.getElementById(hash);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [location.hash]);

  // Helper: fetch all Google Fit datasets
  function syncGoogleFit() {
    if (!fitStatus.connected) return;
    const tzOffsetMinutes = -new Date().getTimezoneOffset();
    Promise.all([
      fetch(`/api/fitness/steps?tzOffsetMinutes=${tzOffsetMinutes}`).then(r=>r.ok?r.json():Promise.reject()),
      fetch('/api/fitness/calories').then(r=>r.ok?r.json():Promise.reject()),
      fetch('/api/fitness/heartrate').then(r=>r.ok?r.json():Promise.reject()),
      fetch('/api/fitness/sleep').then(r=>r.ok?r.json():Promise.reject())
    ]).then(([steps, calories, hr, sleep]) => {
      const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
      const stepsMapped = (steps.series||[]).map(p=>{ const d=new Date(p.start); return { day: days[d.getDay()], steps: p.steps }; });
      setStepsSeries(stepsMapped);
      const calMapped = (calories.series||[]).map(p=>{ const d=new Date(p.start); return { day: days[d.getDay()], intake: 0, burn: Math.round(p.calories) }; });
      setCalSeries(calMapped);
      const hrMapped = (hr.series||[]).map(p=>{ const d=new Date(p.start); return { day: days[d.getDay()], hr: Math.round(p.bpm) }; });
      setHrSeries(hrMapped);
      setSleepDonutLive(sleep.donut || null);
    }).catch(()=>{});
  }

  // Fetch live Google Fit data when connected
  useEffect(() => { syncGoogleFit(); }, [fitStatus.connected]);

  const QuickActionCard = ({ title, description, icon: Icon, onClick, color = '#3B82F6', gradient }) => (
    <div 
      className="quick-action-card" 
      onClick={onClick}
      style={{ '--card-color': color, '--gradient': gradient }}
    >
      <div className="card-background">
        <div className="radial-gradient" />
        <div className="card-pattern" />
      </div>
      <div className="card-content">
        <div className="card-icon">
          <Icon size={24} />
        </div>
        <h3>{title}</h3>
        <p>{description}</p>
        <div className="card-action">
          <Plus size={16} />
          <span>Get Started</span>
        </div>
      </div>
    </div>
  );

  const MetricCard = ({ title, value, unit, icon: Icon, trend, color = '#3B82F6' }) => (
    <div className="metric-card" style={{ '--metric-color': color }}>
      <div className="metric-background">
        <div className="metric-gradient" />
      </div>
      <div className="metric-content">
        <div className="metric-header">
          <Icon size={20} />
          <span>{title}</span>
        </div>
        <div className="metric-value">
          <span className="value">{value}</span>
          <span className="unit">{unit}</span>
        </div>
        {trend && (
          <div className="metric-trend">
            <TrendingUp size={14} />
            <span>{trend}</span>
          </div>
        )}
      </div>
    </div>
  );

  // Top-level tabs are handled by the main NavBar. In-page tabs removed for a cleaner layout.

  if (showDataForm) {
    return (
      <div className="dashboard-container">
        <HealthDataForm 
          onSubmit={handleDataSubmit}
          onCancel={() => setShowDataForm(false)}
        />
      </div>
    );
  }

  if (showReport) {
    return (
      <div className="dashboard-container">
        <HealthReport 
          healthData={healthData}
          onClose={() => setShowReport(false)}
        />
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header" id="overview">
        <div className="header-content">
          <h1>Health Dashboard</h1>
          <p>Welcome back, {user.name || 'User'}</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn primary"
            style={{height:40}}
            onClick={() => setShowDataForm(true)}
          >
            <Plus size={16} />
            Add Health Data
          </button>
          {!fitStatus.connected ? (
            <a href={`/auth/google-fit?token=${encodeURIComponent(localStorage.getItem('iac_token_v1')||'')}`} target="_blank" rel="noopener" className="btn secondary" style={{height:40, display:'inline-flex', alignItems:'center'}} onClick={(e)=>{
              // Start polling immediately; OAuth will run in new tab
              const timer = setInterval(()=>{
                fetch('/auth/google-fit/status').then(r=>r.json()).then(s=>{ setFitStatus(s); if (s.connected) { clearInterval(timer); } }).catch(()=>{});
              }, 1200);
            }}>Connect Google Fit</a>
          ) : (
            <span style={{color:'#10b981',fontWeight:600}}>Google Fit Connected</span>
          )}
          {healthData && (
            <button 
              className="btn secondary"
              onClick={handleGenerateReport}
            >
              <FileText size={16} />
              Generate Report
            </button>
          )}
        </div>
      </div>

      {/* In-page tabs removed; using a single, clean overview layout. */}

      {/* Content */}
      <div className="dashboard-content">
        <div className="overview-section">
          <div className="overview-content">
            {/* Graphs first with time-range filter */}
            <div style={{display:'flex',justifyContent:'flex-end',gap:8,margin:'0 0 12px 0'}} aria-label="Time range filter">
              <button className={`btn ${timeRange==='week' ? 'primary' : 'secondary'}`} style={{height:32,padding:'0 10px'}} onClick={()=>setTimeRange('week')}>Week</button>
              <button className={`btn ${timeRange==='month' ? 'primary' : 'secondary'}`} style={{height:32,padding:'0 10px'}} onClick={()=>setTimeRange('month')}>Month</button>
              <button className={`btn ${timeRange==='year' ? 'primary' : 'secondary'}`} style={{height:32,padding:'0 10px'}} onClick={()=>setTimeRange('year')}>Year</button>
            </div>

            <div id="metrics" className="charts-grid" style={{display:'grid',gridTemplateColumns:'repeat(2, minmax(0,1fr))',gap:12,marginBottom:16}}>
              <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:16,padding:12}}>
                <h4 style={{margin:'0 0 8px 0',color:'#1f2937'}}>Heart Rate Trend</h4>
                <div style={{width:'100%',height:220}} aria-label="Heart rate line chart">
                  <ResponsiveContainer>
                    <LineChart data={hrSeries || filterData(heartBmiData)}>
                      <CartesianGrid stroke="#f3f4f6" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="hr" name="Heart Rate" stroke="#ef4444" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:16,padding:12}}>
                <h4 style={{margin:'0 0 8px 0',color:'#1f2937'}}>Steps per Day</h4>
                <div style={{width:'100%',height:220}} aria-label="Daily steps bar chart">
                  <ResponsiveContainer>
                    <BarChart data={stepsSeries || filterData(activityData)}>
                      <CartesianGrid stroke="#f3f4f6" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="steps" name="Steps" fill="#3b82f6" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:16,padding:12}}>
                <h4 style={{margin:'0 0 8px 0',color:'#1f2937'}}>Sleep Analysis</h4>
                <div style={{width:'100%',height:220}} aria-label="Sleep stages distribution">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={sleepDonutLive || sleepDonut} dataKey="value" nameKey="name" innerRadius={55} outerRadius={75} paddingAngle={2}>
                        {(sleepDonutLive || sleepDonut).map((entry, index) => (
                          <Cell key={`cell-top-${index}`} fill={donutColors[index % donutColors.length]} />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:16,padding:12}}>
                <h4 style={{margin:'0 0 8px 0',color:'#1f2937'}}>Calories Intake vs Burn</h4>
                <div style={{width:'100%',height:220}} aria-label="Calories intake vs burn stacked area chart">
                  <ResponsiveContainer>
                    <AreaChart data={calSeries || filterData(caloriesData)}>
                      <CartesianGrid stroke="#f3f4f6" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="intake" name="Intake" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.25} />
                      <Area type="monotone" dataKey="burn" name="Burn" stroke="#10b981" fill="#10b981" fillOpacity={0.25} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Quick stats below charts */}
            <div className="quick-stats">
              <MetricCard
                title="Heart Rate"
                value={(healthData && healthData.heartRate) || '72'}
                unit="BPM"
                icon={Heart}
                color="#EF4444"
                trend="+2 BPM"
              />
              <MetricCard
                title="Blood Pressure"
                value={healthData && healthData.bloodPressure ? `${healthData.bloodPressure.systolic}/${healthData.bloodPressure.diastolic}` : '120/78'}
                unit="mmHg"
                icon={Activity}
                color="#F59E0B"
              />
              <MetricCard
                title="BMI"
                value={(healthData && healthData.bmi) || '23.5'}
                unit="kg/m²"
                icon={Scale}
                color="#8B5CF6"
              />
              <MetricCard
                title="Steps"
                value={(activityData && activityData.reduce((a,b)=>a+(b.steps||0),0)) || '—'}
                unit="/wk"
                icon={Activity}
                color="#06B6D4"
              />
            </div>

            {/* Actions */}
            <div className="quick-actions">
              <QuickActionCard
                title="Manual Entry"
                description="Enter your health information step by step"
                icon={FileText}
                color="#3B82F6"
                onClick={() => setShowDataForm(true)}
              />
              <QuickActionCard
                title="Upload PDF"
                description="Upload your health reports and lab results"
                icon={Upload}
                color="#10B981"
                onClick={() => setShowDataForm(true)}
              />
            </div>

            {/* Additional charts grid (extended metrics) */}
            <div id="assessment" className="charts-grid" style={{display:'grid',gridTemplateColumns:'repeat(3, minmax(0,1fr))',gap:12,marginTop:12}}>
              <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:16,padding:12}}>
                <h4 style={{margin:'0 0 8px 0',color:'#1f2937'}}>Blood Pressure</h4>
                <div style={{width:'100%',height:200}}>
                  <ResponsiveContainer>
                    <LineChart data={bpData}>
                      <CartesianGrid stroke="#f3f4f6" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="systolic" stroke="#0ea5e9" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="diastolic" stroke="#14b8a6" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:16,padding:12}}>
                <h4 style={{margin:'0 0 8px 0',color:'#1f2937'}}>Steps & Calories</h4>
                <div style={{width:'100%',height:200}}>
                  <ResponsiveContainer>
                    <BarChart data={activityData}>
                      <CartesianGrid stroke="#f3f4f6" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="steps" name="Steps" fill="#3b82f6" radius={[4,4,0,0]} />
                      <Bar dataKey="calories" name="Calories" fill="#f59e0b" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:16,padding:12}}>
                <h4 style={{margin:'0 0 8px 0',color:'#1f2937'}}>Lab Values Comparison</h4>
                <div style={{width:'100%',height:200}} aria-label="Lab metrics radar chart">
                  <ResponsiveContainer>
                    <RadarChart data={labRadar} outerRadius={70}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="metric" />
                      <PolarRadiusAxis />
                      <Radar name="Score" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
                      <Legend />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div id="reports" className="recent-activity">
                  <h3>Recent Activity</h3>
                  <div className="activity-list">
                    <div className="activity-item">
                      <div className="activity-icon">
                        <Heart size={16} />
                      </div>
                      <div className="activity-content">
                        <span>Health data updated</span>
                        <small>2 hours ago</small>
                      </div>
                    </div>
                    <div className="activity-item">
                      <div className="activity-icon">
                        <TrendingUp size={16} />
                      </div>
                      <div className="activity-content">
                        <span>New insights available</span>
                        <small>1 day ago</small>
                      </div>
                    </div>
                  </div>
            </div>
          </div>
          </div>
      </div>

      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner">
            <div className="spinner" />
            <p>Processing your health data...</p>
          </div>
        </div>
      )}
    </div>
  );
}
