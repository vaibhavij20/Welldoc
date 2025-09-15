// frontend/src/components/HealthDataForm.jsx
import React, { useState } from 'react';
import { Upload, FileText, User, Heart, Activity, Scale, Zap } from 'lucide-react';

export default function HealthDataForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    // Personal Information
    name: '',
    age: '',
    gender: '',
    location: '',
    
    // Vital Signs
    bloodPressure: { systolic: '', diastolic: '' },
    glucoseLevel: '',
    heartRate: '',
    weight: '',
    bmi: '',
    
    // Medical History
    existingConditions: '',
    pastTreatments: '',
    allergies: '',
    
    // Medications
    medications: [{ name: '', dosage: '', frequency: '', sideEffects: '' }],
    
    // Lifestyle
    exerciseRoutines: '',
    sleepPatterns: '',
    dietHabits: '',
    stressLevels: '',
  });

  const [activeTab, setActiveTab] = useState('personal');
  const [isUploadMode, setIsUploadMode] = useState(false);

  const tabs = [
    { id: 'personal', label: 'Personal', icon: User },
    { id: 'vitals', label: 'Vitals', icon: Heart },
    { id: 'medical', label: 'Medical', icon: Activity },
    { id: 'medications', label: 'Medications', icon: Zap },
    { id: 'lifestyle', label: 'Lifestyle', icon: Scale },
  ];

  const handleInputChange = (section, field, value) => {
    if (section === 'bloodPressure') {
      setFormData(prev => ({
        ...prev,
        bloodPressure: { ...prev.bloodPressure, [field]: value }
      }));
    } else if (section === 'medications') {
      const newMedications = [...formData.medications];
      newMedications[field] = { ...newMedications[field], [value.field]: value.value };
      setFormData(prev => ({ ...prev, medications: newMedications }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const addMedication = () => {
    setFormData(prev => ({
      ...prev,
      medications: [...prev.medications, { name: '', dosage: '', frequency: '', sideEffects: '' }]
    }));
  };

  const removeMedication = (index) => {
    setFormData(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }));
  };

  const calculateBMI = () => {
    const weight = parseFloat(formData.weight);
    const height = parseFloat(formData.height);
    if (weight && height) {
      const bmi = (weight / ((height / 100) ** 2)).toFixed(1);
      setFormData(prev => ({ ...prev, bmi }));
    }
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  if (isUploadMode) {
    return (
      <div className="health-form-container">
        <div className="form-header">
          <h3>Upload Health Data</h3>
          <button 
            className="btn secondary" 
            onClick={() => setIsUploadMode(false)}
          >
            Switch to Manual Entry
          </button>
        </div>
        
        <div className="upload-section">
          <div className="upload-area">
            <Upload size={48} />
            <h4>Upload PDF Health Report</h4>
            <p>Drag and drop your health report PDF here, or click to browse</p>
            <input 
              type="file" 
              accept=".pdf" 
              className="file-input"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  // Handle PDF processing here
                  console.log('PDF uploaded:', file);
                }
              }}
            />
          </div>
          
          <div className="upload-info">
            <h5>Supported Formats:</h5>
            <ul>
              <li>PDF health reports</li>
              <li>Lab results</li>
              <li>Medical records</li>
              <li>Prescription lists</li>
            </ul>
          </div>
        </div>
        
        <div className="form-actions">
          <button className="btn secondary" onClick={onCancel}>Cancel</button>
          <button className="btn" onClick={() => onSubmit({ type: 'pdf', file: 'uploaded.pdf' })}>
            Process Upload
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="health-form-container">
      <div className="form-header">
        <h3>Health Data Collection</h3>
        <button 
          className="btn secondary" 
          onClick={() => setIsUploadMode(true)}
        >
          <FileText size={16} />
          Upload PDF Instead
        </button>
      </div>

      <div className="form-tabs">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="form-content">
        {activeTab === 'personal' && (
          <div className="form-section">
            <h4>Personal Information</h4>
            <div className="form-grid">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('', 'name', e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
              <div className="form-group">
                <label>Age</label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => handleInputChange('', 'age', e.target.value)}
                  placeholder="Enter your age"
                />
              </div>
              <div className="form-group">
                <label>Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleInputChange('', 'gender', e.target.value)}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('', 'location', e.target.value)}
                  placeholder="City, State/Country"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'vitals' && (
          <div className="form-section">
            <h4>Vital Signs</h4>
            <div className="form-grid">
              <div className="form-group">
                <label>Blood Pressure (mmHg)</label>
                <div className="input-group">
                  <input
                    type="number"
                    value={formData.bloodPressure.systolic}
                    onChange={(e) => handleInputChange('bloodPressure', 'systolic', e.target.value)}
                    placeholder="Systolic"
                  />
                  <span>/</span>
                  <input
                    type="number"
                    value={formData.bloodPressure.diastolic}
                    onChange={(e) => handleInputChange('bloodPressure', 'diastolic', e.target.value)}
                    placeholder="Diastolic"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Glucose Level (mg/dL)</label>
                <input
                  type="number"
                  value={formData.glucoseLevel}
                  onChange={(e) => handleInputChange('', 'glucoseLevel', e.target.value)}
                  placeholder="Enter glucose level"
                />
              </div>
              <div className="form-group">
                <label>Heart Rate (BPM)</label>
                <input
                  type="number"
                  value={formData.heartRate}
                  onChange={(e) => handleInputChange('', 'heartRate', e.target.value)}
                  placeholder="Enter heart rate"
                />
              </div>
              <div className="form-group">
                <label>Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => {
                    handleInputChange('', 'weight', e.target.value);
                    calculateBMI();
                  }}
                  placeholder="Enter weight"
                />
              </div>
              <div className="form-group">
                <label>Height (cm)</label>
                <input
                  type="number"
                  value={formData.height}
                  onChange={(e) => {
                    handleInputChange('', 'height', e.target.value);
                    calculateBMI();
                  }}
                  placeholder="Enter height"
                />
              </div>
              <div className="form-group">
                <label>BMI</label>
                <input
                  type="text"
                  value={formData.bmi || 'Auto-calculated'}
                  readOnly
                  className="readonly"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'medical' && (
          <div className="form-section">
            <h4>Medical History</h4>
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Existing Conditions</label>
                <textarea
                  value={formData.existingConditions}
                  onChange={(e) => handleInputChange('', 'existingConditions', e.target.value)}
                  placeholder="List any existing medical conditions..."
                  rows="4"
                />
              </div>
              <div className="form-group full-width">
                <label>Past Treatments</label>
                <textarea
                  value={formData.pastTreatments}
                  onChange={(e) => handleInputChange('', 'pastTreatments', e.target.value)}
                  placeholder="Describe any past treatments or surgeries..."
                  rows="4"
                />
              </div>
              <div className="form-group full-width">
                <label>Allergies</label>
                <textarea
                  value={formData.allergies}
                  onChange={(e) => handleInputChange('', 'allergies', e.target.value)}
                  placeholder="List any allergies (medications, foods, environmental)..."
                  rows="3"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'medications' && (
          <div className="form-section">
            <h4>Current Medications</h4>
            {formData.medications.map((med, index) => (
              <div key={index} className="medication-card">
                <div className="medication-header">
                  <h5>Medication {index + 1}</h5>
                  {formData.medications.length > 1 && (
                    <button 
                      className="btn-remove" 
                      onClick={() => removeMedication(index)}
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Medication Name</label>
                    <input
                      type="text"
                      value={med.name}
                      onChange={(e) => handleInputChange('medications', index, { field: 'name', value: e.target.value })}
                      placeholder="Enter medication name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Dosage</label>
                    <input
                      type="text"
                      value={med.dosage}
                      onChange={(e) => handleInputChange('medications', index, { field: 'dosage', value: e.target.value })}
                      placeholder="e.g., 10mg"
                    />
                  </div>
                  <div className="form-group">
                    <label>Frequency</label>
                    <input
                      type="text"
                      value={med.frequency}
                      onChange={(e) => handleInputChange('medications', index, { field: 'frequency', value: e.target.value })}
                      placeholder="e.g., Twice daily"
                    />
                  </div>
                  <div className="form-group">
                    <label>Side Effects</label>
                    <input
                      type="text"
                      value={med.sideEffects}
                      onChange={(e) => handleInputChange('medications', index, { field: 'sideEffects', value: e.target.value })}
                      placeholder="Any side effects experienced"
                    />
                  </div>
                </div>
              </div>
            ))}
            <button className="btn secondary" onClick={addMedication}>
              Add Another Medication
            </button>
          </div>
        )}

        {activeTab === 'lifestyle' && (
          <div className="form-section">
            <h4>Lifestyle Factors</h4>
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Exercise Routines</label>
                <textarea
                  value={formData.exerciseRoutines}
                  onChange={(e) => handleInputChange('', 'exerciseRoutines', e.target.value)}
                  placeholder="Describe your exercise routine..."
                  rows="3"
                />
              </div>
              <div className="form-group full-width">
                <label>Sleep Patterns</label>
                <textarea
                  value={formData.sleepPatterns}
                  onChange={(e) => handleInputChange('', 'sleepPatterns', e.target.value)}
                  placeholder="Describe your sleep patterns..."
                  rows="3"
                />
              </div>
              <div className="form-group full-width">
                <label>Diet Habits</label>
                <textarea
                  value={formData.dietHabits}
                  onChange={(e) => handleInputChange('', 'dietHabits', e.target.value)}
                  placeholder="Describe your dietary habits..."
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Stress Level (1-10)</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.stressLevels}
                  onChange={(e) => handleInputChange('', 'stressLevels', e.target.value)}
                  className="stress-slider"
                />
                <div className="slider-labels">
                  <span>Low (1)</span>
                  <span>High (10)</span>
                </div>
                <div className="current-value">Current: {formData.stressLevels || 'Not set'}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="form-actions">
        <button className="btn secondary" onClick={onCancel}>Cancel</button>
        <button className="btn" onClick={handleSubmit}>
          Generate Health Report
        </button>
      </div>
    </div>
  );
}
