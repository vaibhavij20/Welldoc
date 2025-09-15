// frontend/src/components/TwoFactorSetup.jsx
import React, { useState, useEffect } from 'react';
import { setupTwoFactor, verifyTwoFactor, disableTwoFactor, getTwoFactorStatus } from '../lib/api';

export default function TwoFactorSetup() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [verificationToken, setVerificationToken] = useState('');
  const [status, setStatus] = useState('');
  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    const res = await getTwoFactorStatus();
    if (res.success) {
      setIsEnabled(res.data.twoFactorEnabled);
    }
  };

  const handleSetup = async () => {
    setIsLoading(true);
    setStatus('');
    try {
      const res = await setupTwoFactor();
      if (res.success) {
        setQrCode(res.data.qrCode);
        setBackupCodes(res.data.backupCodes);
        setShowSetup(true);
        setStatus('Scan the QR code with your authenticator app');
      } else {
        setStatus(res.error);
      }
    } catch (err) {
      setStatus('Failed to setup 2FA');
    }
    setIsLoading(false);
  };

  const handleVerify = async () => {
    if (!verificationToken) {
      setStatus('Please enter the verification code');
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await verifyTwoFactor(verificationToken);
      if (res.success) {
        setIsEnabled(true);
        setShowSetup(false);
        setStatus('Two-factor authentication enabled successfully!');
        setVerificationToken('');
      } else {
        setStatus(res.error);
      }
    } catch (err) {
      setStatus('Failed to verify 2FA');
    }
    setIsLoading(false);
  };

  const handleDisable = async () => {
    if (!confirm('Are you sure you want to disable two-factor authentication? This will make your account less secure.')) {
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await disableTwoFactor();
      if (res.success) {
        setIsEnabled(false);
        setStatus('Two-factor authentication disabled');
      } else {
        setStatus(res.error);
      }
    } catch (err) {
      setStatus('Failed to disable 2FA');
    }
    setIsLoading(false);
  };

  const copyBackupCodes = () => {
    const codesText = backupCodes.join('\n');
    navigator.clipboard.writeText(codesText);
    setStatus('Backup codes copied to clipboard');
  };

  return (
    <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
      <h3>Two-Factor Authentication</h3>
      
      {isEnabled ? (
        <div>
          <p style={{ color: '#059669', marginBottom: '16px' }}>
            ✅ Two-factor authentication is enabled
          </p>
          <button 
            className="btn secondary" 
            onClick={handleDisable}
            disabled={isLoading}
          >
            {isLoading ? 'Disabling...' : 'Disable 2FA'}
          </button>
        </div>
      ) : (
        <div>
          <p style={{ marginBottom: '16px' }}>
            Two-factor authentication adds an extra layer of security to your account.
          </p>
          <button 
            className="btn" 
            onClick={handleSetup}
            disabled={isLoading}
          >
            {isLoading ? 'Setting up...' : 'Enable 2FA'}
          </button>
        </div>
      )}

      {showSetup && (
        <div style={{ marginTop: '20px' }}>
          <h4>Setup Instructions:</h4>
          <ol style={{ marginBottom: '16px' }}>
            <li>Install an authenticator app like Google Authenticator or Authy</li>
            <li>Scan the QR code below with your authenticator app</li>
            <li>Enter the 6-digit code from your app to verify</li>
          </ol>
          
          {qrCode && (
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <img src={qrCode} alt="QR Code for 2FA setup" style={{ maxWidth: '200px' }} />
            </div>
          )}
          
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="verificationToken">Verification Code:</label>
            <input
              id="verificationToken"
              type="text"
              value={verificationToken}
              onChange={(e) => setVerificationToken(e.target.value)}
              placeholder="Enter 6-digit code"
              maxLength="6"
              style={{ marginLeft: '8px', width: '120px' }}
            />
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <button 
              className="btn" 
              onClick={handleVerify}
              disabled={isLoading || !verificationToken}
            >
              {isLoading ? 'Verifying...' : 'Verify & Enable'}
            </button>
            <button 
              className="btn secondary" 
              onClick={() => setShowSetup(false)}
              style={{ marginLeft: '8px' }}
            >
              Cancel
            </button>
          </div>
          
          {backupCodes.length > 0 && (
            <div>
              <h4>Backup Codes (Save these securely):</h4>
              <div style={{ 
                backgroundColor: '#f9fafb', 
                padding: '12px', 
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: '14px',
                marginBottom: '8px'
              }}>
                {backupCodes.map((code, index) => (
                  <div key={index}>{code}</div>
                ))}
              </div>
              <button 
                className="btn secondary" 
                onClick={copyBackupCodes}
                style={{ fontSize: '12px' }}
              >
                Copy to Clipboard
              </button>
            </div>
          )}
        </div>
      )}
      
      {status && (
        <p style={{ 
          color: status.includes('success') || status.includes('enabled') ? '#059669' : '#dc2626',
          marginTop: '12px',
          fontSize: '14px'
        }}>
          {status}
        </p>
      )}
    </div>
  );
}
