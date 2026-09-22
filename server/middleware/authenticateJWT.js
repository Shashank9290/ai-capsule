// authenticateJWT.js
// Reads the application JWT from the Secure, HttpOnly "token" cookie,
// verifies it, and attaches the authenticated user's identity to req.user.
// The user_id used for all CRUD operations comes ONLY from this verified
// token - it is never accepted from the request body or query string.

const jwt = require('jsonwebtoken');

function authenticateJWT(req, res, next) {
  const token = req.cookies && req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: no token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.sub, username: decoded.username };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: invalid or expired token' });
  }
}

module.exports = authenticateJWT;
