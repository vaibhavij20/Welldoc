// backend/utils/twoFactor.js
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

/**
 * Generates a new 2FA secret for a user
 */
function generateSecret(userEmail) {
  return speakeasy.generateSecret({
    name: `Inclusive AR/VR Coach (${userEmail})`,
    issuer: 'Inclusive AR/VR Coach',
    length: 32
  });
}

/**
 * Generates backup codes for 2FA
 */
function generateBackupCodes() {
  const codes = [];
  for (let i = 0; i < 10; i++) {
    codes.push(Math.random().toString(36).substring(2, 8).toUpperCase());
  }
  return codes;
}

/**
 * Verifies a TOTP token
 */
function verifyToken(secret, token) {
  return speakeasy.totp.verify({
    secret: secret,
    encoding: 'base32',
    token: token,
    window: 2 // Allow 2 time steps tolerance
  });
}

/**
 * Generates QR code data URL for 2FA setup
 */
async function generateQRCode(secret) {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(secret.otpauth_url);
    return qrCodeDataURL;
  } catch (err) {
    throw new Error('Failed to generate QR code');
  }
}

module.exports = {
  generateSecret,
  generateBackupCodes,
  verifyToken,
  generateQRCode
};
