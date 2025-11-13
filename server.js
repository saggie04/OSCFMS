// server.js - minimal Express + Mongoose server with redirect to auth page
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');

// Optional: auto-open browser. Install with: npm install open
let open;
try {
  open = require('open');
} catch (err) {
  open = null;
}

const feedbackRoutes = require('./routes/feedback');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;
const AUTO_OPEN = process.env.AUTO_OPEN !== 'false'; // set AUTO_OPEN=false in .env to disable

// Redirect root URL to login page BEFORE static middleware
app.get('/', (req, res) => {
  res.redirect('/auth.html');
});

// Middleware
app.use(express.json());
app.use(cors()); // allow requests from frontend
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/feedback', feedbackRoutes);
app.use('/api/auth', authRoutes);
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// MongoDB connection event listeners (good diagnostics)
mongoose.connection.on('connected', () => {
  console.log('⚡ MongoDB connected successfully');
});
mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});
mongoose.connection.on('disconnected', () => {
  console.warn('⚠ MongoDB disconnected');
});

// Optional DB status endpoint
app.get('/api/db-status', (req, res) => {
  const state = mongoose.connection.readyState;
  const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  res.json({ status: states[state], code: state });
});

// Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(async () => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}/auth.html`);
    });

    // Auto-open browser (only if 'open' package available and AUTO_OPEN not disabled)
    if (open && AUTO_OPEN) {
      try {
        // Only try to open the auth page
        await open(`http://localhost:${PORT}/auth.html`);
      } catch (err) {
        // ignore open errors
      }
    }
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });
