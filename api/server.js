// api/server.js — Vercel serverless wrapper
require('dotenv').config();
const serverless = require('serverless-http');
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');

const feedbackRoutes = require('../routes/feedback');
const authRoutes = require('../routes/auth');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api/feedback', feedbackRoutes);
app.use('/api/auth', authRoutes);
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// DB connect caching for serverless
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) console.error('MONGO_URI not set');

let connPromise = null;
async function ensureDbConnection() {
  if (connPromise) return connPromise;
  connPromise = mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(m => {
      console.log('⚡ MongoDB connected (serverless)');
      return m.connection;
    })
    .catch(err => {
      connPromise = null;
      console.error('MongoDB connection error (serverless):', err);
      throw err;
    });
  return connPromise;
}

module.exports = async (req, res) => {
  try {
    await ensureDbConnection();
    const handler = serverless(app);
    return handler(req, res);
  } catch (err) {
    console.error('Handler startup error:', err);
    res.status(500).json({ error: 'Server start failed' });
  }
};
