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

// root message to avoid "Cannot GET /"
app.get('/', (req, res) => {
  res.type('text/plain').send('Welldoc API is running. Health: /health');
});

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

// Wellyou Assistant (Gemini)
app.post('/api/assistant/chat', async (req, res) => {
  try {
    const { prompt } = req.body || {};
    if (!prompt) return res.status(400).json({ error: 'prompt_required' });
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'missing_gemini_api_key' });
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const resp = await model.generateContent(prompt);
    const text = resp?.response?.text?.() || 'No response.';
    res.json({ text });
  } catch (e) {
    console.error('assistant error', e);
    res.status(500).json({ error: 'assistant_failed' });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`API running on ${port}`));

// Google Fit OAuth and Fitness endpoints
const { google } = require('googleapis');

const oauth2Client = new (require('google-auth-library').OAuth2Client)(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

const FIT_SCOPES = [
  'https://www.googleapis.com/auth/fitness.activity.read',
  'https://www.googleapis.com/auth/fitness.heart_rate.read',
  'https://www.googleapis.com/auth/fitness.body.read',
  'https://www.googleapis.com/auth/fitness.sleep.read'
];

function extractToken(req) {
  const q = req.query.token;
  if (q) return q;
  const authz = req.headers.authorization;
  if (!authz) return null;
  const parts = authz.split(' ');
  return parts.length === 2 ? parts[1] : null;
}

app.get('/auth/google-fit', (req, res) => {
  const stateToken = extractToken(req) || '';
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: FIT_SCOPES,
    state: stateToken
  });
  res.redirect(url);
});

app.get('/auth/google-fit/callback', async (req, res) => {
  try {
    if (req.query.error) {
      console.error('google-fit oauth error:', req.query.error, req.query.error_description);
      return res.status(400).json({ error: 'oauth_error', details: req.query.error, description: req.query.error_description });
    }
    const { code } = req.query;
    if (!code) return res.status(400).json({ error: 'missing_code' });
    const { tokens } = await oauth2Client.getToken(code);
    // If state contains a JWT, associate tokens to that user
    const stateJwt = req.query.state;
    if (stateJwt) {
      try {
        const decoded = jwt.verify(stateJwt, process.env.JWT_SECRET || 'your-secret-key');
        const userId = decoded.userId;
        await pool.query(
          'UPDATE users SET gfit_access_token=$1, gfit_refresh_token=$2, gfit_expiry=$3 WHERE id=$4',
          [tokens.access_token || null, tokens.refresh_token || null, tokens.expiry_date ? new Date(tokens.expiry_date) : null, userId]
        );
      } catch (e) {
        console.error('failed to save tokens for user from state', e.message);
      }
    } else {
      // fallback single-app memory
      app.set('gfit_tokens', tokens);
    }
    const redirectUrl = process.env.GFIT_POST_CONNECT_URL || 'http://localhost:5173/fit-connected?status=ok';
    res.redirect(302, redirectUrl);
  } catch (e) {
    const resp = e && e.response && e.response.data ? e.response.data : null;
    console.error('google-fit callback error', e?.message, resp);
    res.status(500).json({ error: 'google_fit_oauth_failed', message: e?.message, response: resp });
  }
});

app.get('/auth/google-fit/status', async (req, res) => {
  try {
    const t = app.get('gfit_tokens');
    let connected = !!t;
    let hasRefresh = !!(t && t.refresh_token);
    // Check DB for user-bound tokens
    const token = extractToken(req);
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const userId = decoded.userId;
        const r = await pool.query('SELECT gfit_refresh_token FROM users WHERE id=$1', [userId]);
        if (r.rows.length) {
          connected = connected || !!r.rows[0].gfit_refresh_token;
          hasRefresh = hasRefresh || !!r.rows[0].gfit_refresh_token;
        }
      } catch (_) {}
    }
    res.json({ connected, hasRefreshToken: hasRefresh });
  } catch {
    res.json({ connected: false, hasRefreshToken: false });
  }
});

async function getAuthorizedClient(userId) {
  // Prefer user-bound tokens
  if (userId) {
    const r = await pool.query('SELECT gfit_access_token, gfit_refresh_token, gfit_expiry FROM users WHERE id=$1', [userId]);
    if (r.rows.length && r.rows[0].gfit_refresh_token) {
      oauth2Client.setCredentials({
        access_token: r.rows[0].gfit_access_token || undefined,
        refresh_token: r.rows[0].gfit_refresh_token || undefined,
        expiry_date: r.rows[0].gfit_expiry ? new Date(r.rows[0].gfit_expiry).getTime() : undefined
      });
      return oauth2Client;
    }
  }
  const tokens = app.get('gfit_tokens');
  if (!tokens) throw new Error('not_connected');
  oauth2Client.setCredentials(tokens);
  return oauth2Client;
}

app.get('/api/fitness/steps', async (req, res) => {
  try {
    let userId = null;
    const token = extractToken(req);
    if (token) {
      try { userId = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key').userId; } catch {}
    }
    const auth = await getAuthorizedClient(userId);
    const fitness = google.fitness({ version: 'v1', auth });

    // Align buckets to local midnight using client-provided tz offset (in minutes)
    const tzOffsetMin = Number(req.query.tzOffsetMinutes || 0); // minutes offset from UTC
    const nowUtc = Date.now();
    const nowLocal = nowUtc + tzOffsetMin * 60 * 1000;
    const endLocalMidnight = new Date(nowLocal);
    endLocalMidnight.setHours(24, 0, 0, 0); // next local midnight
    const endMs = endLocalMidnight.getTime() - tzOffsetMin * 60 * 1000; // back to UTC ms
    const startMs = endMs - 7 * 24 * 60 * 60 * 1000;

    const body = {
      aggregateBy: [{
        dataTypeName: 'com.google.step_count.delta',
        dataSourceId: 'derived:com.google.step_count.delta:com.google.android.gms:merge_step_deltas'
      }],
      bucketByTime: { durationMillis: 24 * 60 * 60 * 1000 },
      startTimeMillis: startMs,
      endTimeMillis: endMs
    };

    const resp = await fitness.users.dataset.aggregate({ userId: 'me', requestBody: body });
    const series = (resp.data.bucket || []).map(b => {
      // Sum all points within the bucket (not just the first)
      const points = b.dataset?.[0]?.point || [];
      let total = 0;
      for (const p of points) {
        const val = p.value?.[0]?.intVal || 0;
        total += val;
      }
      return { start: Number(b.startTimeMillis), steps: total };
    });

    res.json({ series });
  } catch (e) {
    const code = e.message === 'not_connected' ? 401 : 500;
    res.status(code).json({ error: e.message });
  }
});

app.get('/api/fitness/calories', async (req, res) => {
  try {
    let userId = null; const token = extractToken(req); if (token) { try { userId = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key').userId; } catch {} }
    const auth = await getAuthorizedClient(userId);
    const fitness = google.fitness({ version: 'v1', auth });
    const endMs = Date.now();
    const startMs = endMs - 7 * 24 * 60 * 60 * 1000;
    const body = {
      aggregateBy: [{ dataTypeName: 'com.google.calories.expended' }],
      bucketByTime: { durationMillis: 24 * 60 * 60 * 1000 },
      startTimeMillis: startMs,
      endTimeMillis: endMs
    };
    const resp = await fitness.users.dataset.aggregate({ userId: 'me', requestBody: body });
    const series = (resp.data.bucket || []).map(b => ({
      start: Number(b.startTimeMillis),
      calories: (b.dataset?.[0]?.point?.[0]?.value?.[0]?.fpVal) || 0
    }));
    res.json({ series });
  } catch (e) {
    const code = e.message === 'not_connected' ? 401 : 500;
    res.status(code).json({ error: e.message });
  }
});

app.get('/api/fitness/heartrate', async (req, res) => {
  try {
    let userId = null; const token = extractToken(req); if (token) { try { userId = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key').userId; } catch {} }
    const auth = await getAuthorizedClient(userId);
    const fitness = google.fitness({ version: 'v1', auth });
    const endMs = Date.now();
    const startMs = endMs - 7 * 24 * 60 * 60 * 1000;
    const body = {
      aggregateBy: [{ dataTypeName: 'com.google.heart_rate.bpm' }],
      bucketByTime: { durationMillis: 24 * 60 * 60 * 1000 },
      startTimeMillis: startMs,
      endTimeMillis: endMs
    };
    const resp = await fitness.users.dataset.aggregate({ userId: 'me', requestBody: body });
    const series = (resp.data.bucket || []).map(b => ({
      start: Number(b.startTimeMillis),
      bpm: (b.dataset?.[0]?.point?.[0]?.value?.[0]?.fpVal) || 0
    }));
    res.json({ series });
  } catch (e) {
    const code = e.message === 'not_connected' ? 401 : 500;
    res.status(code).json({ error: e.message });
  }
});

// Sleep breakdown (Deep/Light/REM) based on com.google.sleep.segment
app.get('/api/fitness/sleep', async (req, res) => {
  try {
    let userId = null; const token = extractToken(req); if (token) { try { userId = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key').userId; } catch {} }
    const auth = await getAuthorizedClient(userId);
    const fitness = google.fitness({ version: 'v1', auth });
    const endMs = Date.now();
    const startMs = endMs - 7 * 24 * 60 * 60 * 1000;

    // Sessions API can be used, but aggregate on segment type via dataset
    const body = {
      aggregateBy: [{ dataTypeName: 'com.google.sleep.segment' }],
      bucketByTime: { durationMillis: 24 * 60 * 60 * 1000 },
      startTimeMillis: startMs,
      endTimeMillis: endMs
    };
    const resp = await fitness.users.dataset.aggregate({ userId: 'me', requestBody: body });

    let totals = { Deep: 0, Light: 0, REM: 0 };
    for (const b of (resp.data.bucket || [])) {
      const points = b.dataset?.[0]?.point || [];
      for (const p of points) {
        const segType = p.value?.[0]?.intVal; // 1=Light, 2=Deep, 3=REM, 4=Awake
        const duration = (Number(p.endTimeNanos) - Number(p.startTimeNanos)) / 1e9; // seconds
        if (segType === 2) totals.Deep += duration;
        else if (segType === 1) totals.Light += duration;
        else if (segType === 3) totals.REM += duration;
      }
    }
    const total = Math.max(1, totals.Deep + totals.Light + totals.REM);
    const donut = [
      { name: 'Deep', value: Math.round((totals.Deep / total) * 100) },
      { name: 'Light', value: Math.round((totals.Light / total) * 100) },
      { name: 'REM', value: Math.round((totals.REM / total) * 100) }
    ];
    res.json({ donut, seconds: totals });
  } catch (e) {
    const code = e.message === 'not_connected' ? 401 : 500;
    res.status(code).json({ error: e.message });
  }
});

