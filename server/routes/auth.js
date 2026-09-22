// routes/auth.js
// Implements the GitHub OAuth Web Application flow manually (no Firebase Auth,
// per assignment requirement) and issues the application's own JWT afterwards.
//
// Flow:
//   1. GET /api/auth/github            -> redirect user to GitHub's consent screen
//   2. GET /api/auth/github/callback   -> exchange code for GitHub access token,
//                                          fetch the GitHub profile, sign an
//                                          application JWT, set it as a Secure,
//                                          HttpOnly cookie named "token", then
//                                          redirect into the protected dashboard.

const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();

const {
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  GITHUB_CALLBACK_URL,
  JWT_SECRET,
  NODE_ENV
} = process.env;

router.get('/github', (req, res) => {
  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: GITHUB_CALLBACK_URL,
    scope: 'read:user'
  });
  res.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
});

router.get('/github/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send('Missing OAuth code from GitHub.');

  try {
    // Step 1: exchange the temporary code for a GitHub access token
    const tokenResp = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: GITHUB_CALLBACK_URL
      })
    });
    const tokenData = await tokenResp.json();

    if (!tokenData.access_token) {
      console.error('GitHub token exchange failed:', tokenData);
      return res.status(401).send('GitHub OAuth failed.');
    }

    // Step 2: fetch the authenticated GitHub user's profile
    const userResp = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        'User-Agent': 'ai-capsule-app'
      }
    });
    const githubUser = await userResp.json();

    if (!githubUser || !githubUser.id) {
      return res.status(401).send('Could not retrieve GitHub profile.');
    }

    // Step 3: issue OUR OWN application JWT (not the GitHub token) and store
    // it as a Secure, HttpOnly cookie named "token".
    const appToken = jwt.sign(
      { sub: String(githubUser.id), username: githubUser.login },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', appToken, {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.redirect('/dashboard');
  } catch (err) {
    console.error('OAuth callback error:', err);
    res.status(500).send('Internal error during OAuth callback.');
  }
});

// Lets the frontend ask "who am I" using the cookie, without exposing the raw JWT.
router.get('/me', (req, res) => {
  const token = req.cookies && req.cookies.token;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ id: decoded.sub, username: decoded.username });
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: NODE_ENV === 'production',
    sameSite: 'lax'
  });
  res.json({ ok: true });
});

module.exports = router;
