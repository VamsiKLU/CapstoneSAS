'use strict';

require('dotenv').config();

const express = require('express');
const session = require('express-session');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const userStore = require('./services/userStore');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// ---------------------------------------------------------------------------
// CORS -- allow frontend origin with credentials
// ---------------------------------------------------------------------------
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ---------------------------------------------------------------------------
// Body parsing
// ---------------------------------------------------------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ---------------------------------------------------------------------------
// Session -- HttpOnly, SameSite=Lax, secure in production
// ---------------------------------------------------------------------------
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'insecure-fallback-change-me',
    name: 'ph_session',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  })
);

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
app.use('/auth', authRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Global error handler
app.use((err, _req, res, _next) => {
  console.error('[Server] Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------
async function start() {
  await userStore.seedAdmin();
  app.listen(PORT, () => {
    console.log(`[Server] PipelineHub backend running on http://localhost:${PORT}`);
    console.log(`[Server] Frontend URL: ${FRONTEND_URL}`);
    console.log(`[Server] GitHub callback: ${process.env.GITHUB_CALLBACK_URL || 'not configured'}`);
  });
}

start().catch((err) => {
  console.error('[Server] Failed to start:', err);
  process.exit(1);
});
