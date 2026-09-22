'use strict';

const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const githubService = require('../services/githubService');
const userStore = require('../services/userStore');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

// ---------------------------------------------------------------------------
// GET /auth/github
// Initiates GitHub OAuth flow. Generates a CSRF state token and redirects.
// ---------------------------------------------------------------------------
router.get('/github', (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId || clientId === 'your_github_client_id') {
    return res.status(503).json({
      error: 'GitHub authentication is not configured. Set GITHUB_CLIENT_ID in the backend .env file.',
      code: 'GITHUB_NOT_CONFIGURED',
    });
  }

  const state = uuidv4();
  req.session.oauthState = state;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: process.env.GITHUB_CALLBACK_URL,
    scope: 'read:user user:email',
    state,
  });

  res.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
});

// ---------------------------------------------------------------------------
// GET /auth/github/callback
// GitHub redirects here with ?code=...&state=...
// Exchanges code for access token, fetches user identity, creates session.
// ---------------------------------------------------------------------------
router.get('/github/callback', async (req, res) => {
  const { code, state, error: githubError, error_description } = req.query;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  if (githubError) {
    const msg = encodeURIComponent(error_description || githubError || 'GitHub authorization failed');
    return res.redirect(`${frontendUrl}/auth/error?reason=${msg}`);
  }

  if (!code) {
    return res.redirect(`${frontendUrl}/auth/error?reason=${encodeURIComponent('No authorization code received')}`);
  }

  try {
    const expectedState = req.session.oauthState;
    delete req.session.oauthState;

    const accessToken = await githubService.exchangeCodeForToken(code, state, expectedState);
    const githubProfile = await githubService.fetchGithubUser(accessToken);
    const user = userStore.upsertGithubUser(githubProfile);

    // Establish session -- do not expose accessToken to the client
    req.session.userId = user.id;
    req.session.role = user.role;
    // Store access token server-side in session (not exposed to client)
    req.session.githubAccessToken = accessToken;

    res.redirect(`${frontendUrl}/dashboard`);
  } catch (err) {
    console.error('[Auth] GitHub callback error:', err.message);
    const reason = encodeURIComponent(err.message || 'GitHub authentication failed');
    res.redirect(`${frontendUrl}/auth/error?reason=${reason}`);
  }
});

// ---------------------------------------------------------------------------
// POST /auth/admin/login
// Admin email + password login.
// ---------------------------------------------------------------------------
router.post('/admin/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = userStore.findByEmail(email);
  if (!user || user.role !== 'ADMIN') {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  req.session.userId = user.id;
  req.session.role = user.role;

  res.json({ user: userStore.publicProfile(user) });
});

// ---------------------------------------------------------------------------
// GET /auth/me
// Returns the current authenticated user (from session).
// ---------------------------------------------------------------------------
router.get('/me', requireAuth, (req, res) => {
  const user = userStore.findById(req.session.userId);
  if (!user) {
    req.session.destroy(() => {});
    return res.status(401).json({ error: 'Session invalid -- please sign in again' });
  }
  res.json({ user: userStore.publicProfile(user) });
});

// ---------------------------------------------------------------------------
// POST /auth/logout
// Destroys the server-side session.
// ---------------------------------------------------------------------------
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('[Auth] Session destroy error:', err);
    }
    res.clearCookie('ph_session');
    res.json({ ok: true });
  });
});

module.exports = router;
