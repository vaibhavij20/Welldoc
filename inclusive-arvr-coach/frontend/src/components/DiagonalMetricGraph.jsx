// frontend/src/components/DiagonalMetricGraph.jsx
import React from 'react';
import { Heart, Activity, Brain, Shield, Zap } from 'lucide-react';

export default function DiagonalMetricGraph({ healthData }) {
  if (!healthData) return null;

  // Calculate health scores for each metric (0-100 scale)
  const calculateScore = (value, optimal, critical) => {
    if (!value) return 0;
    const normalized = Math.max(0, Math.min(100, ((value - critical) / (optimal - critical)) * 100));
    return Math.round(normalized);
  };

  // Define health metrics with optimal and critical values
  const metrics = [
    {
      id: 'cardiovascular',
      name: 'Cardiovascular',
      icon: Heart,
      color: '#EF4444',
      score: calculateScore(
        healthData.heartRate,
        70, // optimal
        100 // critical
      ),
      value: healthData.heartRate,
      unit: 'BPM',
      description: 'Heart health and circulation'
    },
    {
      id: 'metabolic',
      name: 'Metabolic',
      icon: Activity,
      color: '#10B981',
      score: calculateScore(
        healthData.glucoseLevel,
        100, // optimal
        200 // critical
      ),
      value: healthData.glucoseLevel,
      unit: 'mg/dL',
      description: 'Blood sugar and metabolism'
    },
    {
      id: 'cognitive',
      name: 'Cognitive',
      icon: Brain,
      color: '#8B5CF6',
      score: calculateScore(
        10 - (healthData.stressLevels || 5),
        8, // optimal (low stress)
        2 // critical (high stress)
      ),
      value: healthData.stressLevels,
      unit: '/10',
      description: 'Mental health and stress levels'
    },
    {
      id: 'immune',
      name: 'Immune',
      icon: Shield,
      color: '#F59E0B',
      score: calculateScore(
        healthData.bmi,
        22, // optimal BMI
        30 // critical BMI
      ),
      value: healthData.bmi,
      unit: 'kg/m²',
      description: 'Immune system strength'
    },
    {
      id: 'energy',
      name: 'Energy',
      icon: Zap,
      color: '#06B6D4',
      score: calculateScore(
        healthData.exerciseRoutines ? 8 : 3,
        8, // optimal (regular exercise)
        2 // critical (no exercise)
      ),
      value: healthData.exerciseRoutines ? 'Active' : 'Inactive',
      unit: '',
      description: 'Physical energy and vitality'
    }
  ];

  const getLevelLabel = (score) => {
    if (score >= 80) return { label: 'Excellent', color: '#10B981' };
    if (score >= 60) return { label: 'Good', color: '#84CC16' };
    if (score >= 40) return { label: 'Fair', color: '#F59E0B' };
    if (score >= 20) return { label: 'Poor', color: '#F97316' };
    return { label: 'Critical', color: '#EF4444' };
  };

  const getOverallHealth = () => {
    const totalScore = metrics.reduce((sum, metric) => sum + metric.score, 0);
    const averageScore = totalScore / metrics.length;
    return getLevelLabel(averageScore);
  };

  const overallHealth = getOverallHealth();

  return (
    <div className="diagonal-metric-graph">
      <div className="graph-header">
        <h3>Health Assessment Dashboard</h3>
        <div className="overall-score">
          <div className="score-circle" style={{ '--score-color': overallHealth.color }}>
            <span className="score-value">{Math.round(metrics.reduce((sum, m) => sum + m.score, 0) / metrics.length)}</span>
            <span className="score-label">Overall</span>
          </div>
          <div className="score-details">
            <h4>Health Status: {overallHealth.label}</h4>
            <p>Based on comprehensive health metrics analysis</p>
          </div>
        </div>
      </div>

      <div className="metrics-grid">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          const level = getLevelLabel(metric.score);
          
          return (
            <div key={metric.id} className="metric-item" style={{ '--metric-color': metric.color }}>
              <div className="metric-header">
                <div className="metric-icon">
                  <Icon size={24} />
                </div>
                <div className="metric-info">
                  <h4>{metric.name}</h4>
                  <p>{metric.description}</p>
                </div>
              </div>
              
              <div className="metric-visualization">
                <div className="score-bar">
                  <div 
                    className="score-fill" 
                    style={{ 
                      width: `${metric.score}%`,
                      backgroundColor: metric.color,
                      opacity: 0.8
                    }}
                  />
                </div>
                <div className="score-details">
                  <span className="score-value">{metric.score}/100</span>
                  <span className="score-level" style={{ color: level.color }}>
                    {level.label}
                  </span>
                </div>
              </div>
              
              <div className="metric-data">
                <div className="data-value">
                  <span className="value">{metric.value || '--'}</span>
                  <span className="unit">{metric.unit}</span>
                </div>
                <div className="data-status">
                  <div 
                    className="status-indicator" 
                    style={{ backgroundColor: level.color }}
                  />
                  <span>{level.label}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="health-insights">
        <h4>Health Insights</h4>
        <div className="insights-grid">
          {metrics.map(metric => {
            const level = getLevelLabel(metric.score);
            const insights = {
              'Excellent': 'Maintain your current healthy habits!',
              'Good': 'You\'re doing well, consider minor improvements.',
              'Fair': 'Focus on this area for better health outcomes.',
              'Poor': 'This area needs immediate attention.',
              'Critical': 'Consult with a healthcare professional.'
            };
            
            return (
              <div key={metric.id} className="insight-item">
                <div className="insight-header">
                  <metric.icon size={16} />
                  <span>{metric.name}</span>
                </div>
                <p className={`insight-text ${level.label.toLowerCase()}`}>
                  {insights[level.label]}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="recommendations">
        <h4>Recommendations</h4>
        <div className="recommendations-list">
          {metrics.filter(m => m.score < 60).map(metric => (
            <div key={metric.id} className="recommendation-item">
              <div className="recommendation-icon">
                <metric.icon size={16} />
              </div>
              <div className="recommendation-content">
                <strong>{metric.name}:</strong> Focus on improving this area through lifestyle changes, 
                regular monitoring, and consultation with healthcare professionals.
              </div>
            </div>
          ))}
          {metrics.filter(m => m.score < 60).length === 0 && (
            <div className="recommendation-item positive">
              <div className="recommendation-content">
                <strong>Excellent Health!</strong> All your health metrics are in good ranges. 
                Continue maintaining your healthy lifestyle and regular check-ups.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
