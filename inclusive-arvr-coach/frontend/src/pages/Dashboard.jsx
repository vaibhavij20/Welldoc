// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
  Heart, Activity, FileText, Upload, BarChart3, 
  TrendingUp, Shield, Zap, Brain, Scale,
  Plus, Settings, Download, Share2
} from 'lucide-react';
import HealthDataForm from '../components/HealthDataForm';
import HealthMetrics from '../components/HealthMetrics';
import DiagonalMetricGraph from '../components/DiagonalMetricGraph';
import HealthReport from '../components/HealthReport';
import { getUser } from '../lib/userStore';

export default function Dashboard() {
  const [currentView, setCurrentView] = useState('overview');
  const [healthData, setHealthData] = useState(null);
  const [showDataForm, setShowDataForm] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const user = getUser() || { email: 'anon' };

  // Simulate loading health data
  useEffect(() => {
    const savedData = localStorage.getItem('healthData');
    if (savedData) {
      setHealthData(JSON.parse(savedData));
    }
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

  const NavigationTab = ({ id, label, icon: Icon, isActive, onClick }) => (
    <button 
      className={`nav-tab ${isActive ? 'active' : ''}`}
      onClick={() => onClick(id)}
    >
      <Icon size={18} />
      <span>{label}</span>
    </button>
  );

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
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Health Dashboard</h1>
          <p>Welcome back, {user.name || 'User'}</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn primary"
            onClick={() => setShowDataForm(true)}
          >
            <Plus size={16} />
            Add Health Data
          </button>
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

      {/* Navigation */}
      <div className="dashboard-nav">
        <NavigationTab
          id="overview"
          label="Overview"
          icon={BarChart3}
          isActive={currentView === 'overview'}
          onClick={setCurrentView}
        />
        <NavigationTab
          id="metrics"
          label="Metrics"
          icon={Activity}
          isActive={currentView === 'metrics'}
          onClick={setCurrentView}
        />
        <NavigationTab
          id="assessment"
          label="Assessment"
          icon={Shield}
          isActive={currentView === 'assessment'}
          onClick={setCurrentView}
        />
        <NavigationTab
          id="reports"
          label="Reports"
          icon={FileText}
          isActive={currentView === 'reports'}
          onClick={setCurrentView}
        />
      </div>

      {/* Content */}
      <div className="dashboard-content">
        {currentView === 'overview' && (
          <div className="overview-section">
            {!healthData ? (
              <div className="empty-state">
                <div className="empty-content">
                  <Heart size={64} />
                  <h2>Start Your Health Journey</h2>
                  <p>Begin by adding your health data to get personalized insights and recommendations.</p>
                  <div className="quick-actions">
                    <QuickActionCard
                      title="Manual Entry"
                      description="Enter your health information step by step"
                      icon={FileText}
                      color="#3B82F6"
                      gradient="linear-gradient(135deg, #3B82F6, #1D4ED8)"
                      onClick={() => setShowDataForm(true)}
                    />
                    <QuickActionCard
                      title="Upload PDF"
                      description="Upload your health reports and lab results"
                      icon={Upload}
                      color="#10B981"
                      gradient="linear-gradient(135deg, #10B981, #059669)"
                      onClick={() => setShowDataForm(true)}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="overview-content">
                <div className="quick-stats">
                  <MetricCard
                    title="Heart Rate"
                    value={healthData.heartRate || '--'}
                    unit="BPM"
                    icon={Heart}
                    color="#EF4444"
                    trend="+2 BPM"
                  />
                  <MetricCard
                    title="Blood Pressure"
                    value={healthData.bloodPressure ? `${healthData.bloodPressure.systolic}/${healthData.bloodPressure.diastolic}` : '--'}
                    unit="mmHg"
                    icon={Activity}
                    color="#F59E0B"
                  />
                  <MetricCard
                    title="BMI"
                    value={healthData.bmi || '--'}
                    unit="kg/m²"
                    icon={Scale}
                    color="#8B5CF6"
                  />
                  <MetricCard
                    title="Stress Level"
                    value={healthData.stressLevels || '--'}
                    unit="/10"
                    icon={Brain}
                    color="#06B6D4"
                    trend="-1 level"
                  />
                </div>
                
                <div className="recent-activity">
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
            )}
          </div>
        )}

        {currentView === 'metrics' && healthData && (
          <HealthMetrics healthData={healthData} />
        )}

        {currentView === 'assessment' && healthData && (
          <DiagonalMetricGraph healthData={healthData} />
        )}

        {currentView === 'reports' && (
          <div className="reports-section">
            <div className="reports-header">
              <h3>Health Reports</h3>
              <p>Generate and download comprehensive health reports</p>
            </div>
            
            {healthData ? (
              <div className="reports-content">
                <div className="report-card">
                  <div className="report-icon">
                    <FileText size={24} />
                  </div>
                  <div className="report-info">
                    <h4>Comprehensive Health Report</h4>
                    <p>Complete analysis of your health data with recommendations</p>
                    <div className="report-meta">
                      <span>Last updated: {new Date().toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="report-actions">
                    <button className="btn secondary">
                      <Download size={16} />
                      Download
                    </button>
                    <button className="btn">
                      <Share2 size={16} />
                      Share
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="empty-reports">
                <FileText size={48} />
                <h4>No Reports Available</h4>
                <p>Add your health data to generate comprehensive reports</p>
                <button 
                  className="btn primary"
                  onClick={() => setShowDataForm(true)}
                >
                  Add Health Data
                </button>
              </div>
            )}
          </div>
        )}
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
