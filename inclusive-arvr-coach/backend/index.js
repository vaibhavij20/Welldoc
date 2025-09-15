// backend/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('./db');
const { validatePassword, validateEmail } = require('./utils/validation');
const { generateSecret, generateBackupCodes, verifyToken: verifyTOTPToken, generateQRCode } = require('./utils/twoFactor');

const app = express();
app.use(cors());
app.use(express.json()); 

// simple health check
app.get('/health', (req, res) => res.json({ ok: true }));

// JWT secret (in production, use a proper secret)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// POST /auth/signup
app.post('/auth/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }
  
  // Validate email format
  if (!validateEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  
  // Validate password strength
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    return res.status(400).json({ 
      error: 'Password does not meet requirements',
      details: passwordValidation.errors
    });
  }
  
  try {
    // Check if user already exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Create user
    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, category, two_factor_enabled',
      [name, email, passwordHash]
    );
    
    const user = result.rows[0];
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ 
      success: true, 
      token, 
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        category: user.category,
        twoFactorEnabled: user.two_factor_enabled
      }
    });
  } catch (err) {
    console.error('signup error', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST /auth/login
app.post('/auth/login', async (req, res) => {
  const { email, password, twoFactorToken } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  try {
    // Find user
    const result = await pool.query(
      'SELECT id, name, email, password_hash, category, two_factor_enabled, two_factor_secret FROM users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    
    // Check password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    // Check if 2FA is enabled
    if (user.two_factor_enabled) {
      if (!twoFactorToken) {
        return res.status(200).json({ 
          success: false, 
          requiresTwoFactor: true,
          message: 'Two-factor authentication required'
        });
      }
      
      // Verify 2FA token
      const isValidToken = verifyTOTPToken(user.two_factor_secret, twoFactorToken);
      if (!isValidToken) {
        return res.status(400).json({ error: 'Invalid two-factor authentication code' });
      }
    }
    
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ 
      success: true, 
      token, 
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        category: user.category,
        twoFactorEnabled: user.two_factor_enabled
      }
    });
  } catch (err) {
    console.error('login error', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Middleware to verify JWT token
function verifyJWT(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// POST /auth/2fa/setup - Generate 2FA secret and QR code
app.post('/auth/2fa/setup', verifyJWT, async (req, res) => {
  try {
    const userId = req.userId;
    
    // Get user email from database
    const userResult = await pool.query('SELECT email FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userEmail = userResult.rows[0].email;
    
    // Generate new 2FA secret
    const secret = generateSecret(userEmail);
    const backupCodes = generateBackupCodes();
    
    // Generate QR code
    const qrCodeDataURL = await generateQRCode(secret);
    
    // Store secret and backup codes in database (but don't enable 2FA yet)
    await pool.query(
      'UPDATE users SET two_factor_secret = $1, two_factor_backup_codes = $2 WHERE id = $3',
      [secret.base32, backupCodes, userId]
    );
    
    res.json({
      success: true,
      secret: secret.base32,
      qrCode: qrCodeDataURL,
      backupCodes: backupCodes
    });
  } catch (err) {
    console.error('2FA setup error', err);
    res.status(500).json({ error: 'Failed to setup 2FA' });
  }
});

// POST /auth/2fa/verify - Verify 2FA token and enable 2FA
app.post('/auth/2fa/verify', verifyJWT, async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }
  
  try {
    const userId = req.userId;
    
    // Get user's 2FA secret
    const result = await pool.query(
      'SELECT two_factor_secret FROM users WHERE id = $1',
      [userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = result.rows[0];
    if (!user.two_factor_secret) {
      return res.status(400).json({ error: '2FA not set up. Please run setup first.' });
    }
    
    // Verify token
    const isValidToken = verifyTOTPToken(user.two_factor_secret, token);
    if (!isValidToken) {
      return res.status(400).json({ error: 'Invalid token' });
    }
    
    // Enable 2FA
    await pool.query(
      'UPDATE users SET two_factor_enabled = true WHERE id = $1',
      [userId]
    );
    
    res.json({ success: true, message: '2FA enabled successfully' });
  } catch (err) {
    console.error('2FA verify error', err);
    res.status(500).json({ error: 'Failed to verify 2FA' });
  }
});

// POST /auth/2fa/disable - Disable 2FA
app.post('/auth/2fa/disable', verifyJWT, async (req, res) => {
  try {
    const userId = req.userId;
    
    await pool.query(
      'UPDATE users SET two_factor_enabled = false, two_factor_secret = NULL, two_factor_backup_codes = NULL WHERE id = $1',
      [userId]
    );
    
    res.json({ success: true, message: '2FA disabled successfully' });
  } catch (err) {
    console.error('2FA disable error', err);
    res.status(500).json({ error: 'Failed to disable 2FA' });
  }
});

// GET /auth/2fa/status - Get 2FA status
app.get('/auth/2fa/status', verifyJWT, async (req, res) => {
  try {
    const userId = req.userId;
    
    const result = await pool.query(
      'SELECT two_factor_enabled FROM users WHERE id = $1',
      [userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ 
      success: true, 
      twoFactorEnabled: result.rows[0].two_factor_enabled 
    });
  } catch (err) {
    console.error('2FA status error', err);
    res.status(500).json({ error: 'Failed to get 2FA status' });
  }
});

// POST /api/events
app.post('/api/events', async (req, res) => {
  const { userId, sessionId, eventType, scenario, timestamp, details } = req.body;
  if (!eventType) return res.status(400).json({ error: 'eventType required' });
  try {
    const q = `INSERT INTO events (user_id, session_id, event_type, scenario, timestamp, details)
               VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`;
    const result = await pool.query(q, [
      userId || null,
      sessionId || null,
      eventType,
      scenario || null,
      timestamp || new Date(),
      details || {}
    ]);
    res.json({ status: 'ok', id: result.rows[0].id });
  } catch (err) {
    console.error('events insert error', err);
    res.status(500).json({ error: 'db_error' });
  }
});

// POST /api/consent
app.post('/api/consent', async (req, res) => {
  const { userId, consent, timestamp } = req.body;
  if (!consent) return res.status(400).json({ error: 'consent required' });
  try {
    const q = `INSERT INTO consents (user_id, consent, granted_at)
               VALUES ($1,$2,$3) RETURNING id`;
    const result = await pool.query(q, [userId || null, consent, timestamp || new Date()]);
    res.json({ status: 'ok', id: result.rows[0].id });
  } catch (err) {
    console.error('consent insert error', err);
    res.status(500).json({ error: 'db_error' });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`API running on ${port}`));

