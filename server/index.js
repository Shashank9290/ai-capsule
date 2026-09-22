// index.js
// Main Express entry point. Serves the built React app AND the API from the
// same origin/port, which avoids CORS and cross-origin cookie problems in
// production (the recommended deployment approach per the assignment spec).

require('dotenv').config();

const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const capsuleRoutes = require('./routes/capsules');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL || true,
    credentials: true
  })
);

// Public health check - required exact route and response shape
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/capsules', capsuleRoutes);

// Serve the built React frontend (client/dist) for every non-API route.
const clientDist = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDist));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(clientDist, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`AI Capsule server listening on port ${PORT}`);
});
