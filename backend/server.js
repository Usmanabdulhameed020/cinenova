const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = process.env.FRONTEND_URL 
  ? [process.env.FRONTEND_URL, 'http://localhost:5173', 'http://localhost:3000']
  : true; // fallback to allow all if not set

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Database Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cineflow';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Root Route
app.get('/', (req, res) => {
  res.send('Backend is running successfully');
});

// Health Route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'Backend is running',
    database:
      mongoose.connection.readyState === 1
        ? 'Connected'
        : 'Disconnected',
  });
});

// Watchlist Routes
const watchlistRoutes = require('./routes/watchlist');
app.use('/api/watchlist', watchlistRoutes);

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});