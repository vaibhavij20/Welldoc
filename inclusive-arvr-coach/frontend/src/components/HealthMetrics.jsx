// frontend/src/components/HealthMetrics.jsx
import React from 'react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { Heart, Activity, Droplets, Zap, Scale, TrendingUp } from 'lucide-react';

export default function HealthMetrics({ healthData }) {
  if (!healthData) return null;

  // Prepare data for charts
  const vitalsData = [
    { name: 'Blood Pressure', systolic: healthData.bloodPressure?.systolic || 0, diastolic: healthData.bloodPressure?.diastolic || 0 },
    { name: 'Heart Rate', value: healthData.heartRate || 0 },
    { name: 'Glucose', value: healthData.glucoseLevel || 0 },
    { name: 'BMI', value: healthData.bmi || 0 },
  ];

  const lifestyleData = [
    { name: 'Exercise', value: healthData.exerciseRoutines ? 8 : 3 },
    { name: 'Sleep', value: healthData.sleepPatterns ? 7 : 4 },
    { name: 'Diet', value: healthData.dietHabits ? 6 : 5 },
    { name: 'Stress', value: 10 - (healthData.stressLevels || 5) },
  ];

  const medicationData = healthData.medications?.map((med, index) => ({
    name: med.name || `Med ${index + 1}`,
    value: med.dosage ? 1 : 0,
  })) || [];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const MetricCard = ({ title, value, unit, icon: Icon, trend, color = '#3B82F6' }) => (
    <div className="metric-card" style={{ '--card-color': color }}>
      <div className="metric-header">
        <Icon size={20} />
        <span className="metric-title">{title}</span>
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
  );

  return (
    <div className="health-metrics">
      <div className="metrics-header">
        <h3>Health Metrics Dashboard</h3>
        <p>Comprehensive overview of your health data</p>
      </div>

      {/* Key Metrics Cards */}
      <div className="metrics-grid">
        <MetricCard
          title="Blood Pressure"
          value={`${healthData.bloodPressure?.systolic || '--'}/${healthData.bloodPressure?.diastolic || '--'}`}
          unit="mmHg"
          icon={Heart}
          color="#EF4444"
        />
        <MetricCard
          title="Heart Rate"
          value={healthData.heartRate || '--'}
          unit="BPM"
          icon={Activity}
          color="#F59E0B"
        />
        <MetricCard
          title="Glucose Level"
          value={healthData.glucoseLevel || '--'}
          unit="mg/dL"
          icon={Droplets}
          color="#10B981"
        />
        <MetricCard
          title="BMI"
          value={healthData.bmi || '--'}
          unit="kg/m²"
          icon={Scale}
          color="#8B5CF6"
        />
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-row">
          {/* Blood Pressure Chart */}
          <div className="chart-container">
            <h4>Blood Pressure Trends</h4>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={vitalsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="systolic" stackId="1" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} />
                <Area type="monotone" dataKey="diastolic" stackId="1" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Lifestyle Radar Chart */}
          <div className="chart-container">
            <h4>Lifestyle Factors</h4>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={lifestyleData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="name" />
                <PolarRadiusAxis angle={30} domain={[0, 10]} />
                <Radar name="Score" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-row">
          {/* Vital Signs Bar Chart */}
          <div className="chart-container">
            <h4>Vital Signs Overview</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={vitalsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Medications Pie Chart */}
          <div className="chart-container">
            <h4>Medication Overview</h4>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={medicationData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {medicationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Health Summary */}
      <div className="health-summary">
        <h4>Health Summary</h4>
        <div className="summary-grid">
          <div className="summary-item">
            <strong>Age:</strong> {healthData.age || 'Not specified'} years
          </div>
          <div className="summary-item">
            <strong>Gender:</strong> {healthData.gender || 'Not specified'}
          </div>
          <div className="summary-item">
            <strong>Location:</strong> {healthData.location || 'Not specified'}
          </div>
          <div className="summary-item">
            <strong>Weight:</strong> {healthData.weight || 'Not specified'} kg
          </div>
          <div className="summary-item">
            <strong>Stress Level:</strong> {healthData.stressLevels || 'Not specified'}/10
          </div>
          <div className="summary-item">
            <strong>Medications:</strong> {healthData.medications?.length || 0} active
          </div>
        </div>
      </div>
    </div>
  );
}
