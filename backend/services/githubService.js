'use strict';

const axios = require('axios');

/**
 * Exchange a GitHub OAuth code for an access token.
 * Returns the access token string.
 */
async function exchangeCodeForToken(code, state, expectedState) {
  if (!state || state !== expectedState) {
    const err = new Error('OAuth state mismatch -- possible CSRF attempt');
    err.code = 'STATE_MISMATCH';
    throw err;
  }

  const response = await axios.post(
    'https://github.com/login/oauth/access_token',
    {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: process.env.GITHUB_CALLBACK_URL,
    },
    { headers: { Accept: 'application/json' } }
  );

  const { access_token, error, error_description } = response.data;
  if (error || !access_token) {
    const err = new Error(error_description || error || 'GitHub token exchange failed');
    err.code = 'TOKEN_EXCHANGE_FAILED';
    throw err;
  }

  return access_token;
}

/**
 * Fetch the authenticated GitHub user's basic profile.
 * Returns only the fields needed to establish a PipelineHub identity.
 */
async function fetchGithubUser(accessToken) {
  const { data } = await axios.get('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });

  // Fetch email separately if not public (many users hide it)
  let email = data.email || null;
  if (!email) {
    try {
      const emailRes = await axios.get('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      });
      const primary = emailRes.data.find((e) => e.primary && e.verified);
      email = primary ? primary.email : null;
    } catch {
      // Email fetch is best-effort -- do not fail authentication if it fails
    }
  }

  return {
    github_id: data.id,
    github_username: data.login,
    name: data.name || data.login,
    email,
    avatar_url: data.avatar_url || null,
    github_profile_url: data.html_url || null,
  };
}

module.exports = { exchangeCodeForToken, fetchGithubUser };
