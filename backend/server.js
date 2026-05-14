const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cineflow';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Root Route
app.get('/', (req, res) => {
  res.send('Backend is up!');
});

// Basic Health Route
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend is running', database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected' });
});

// Watchlist Routes
const watchlistRoutes = require('./routes/watchlist');
app.use('/api/watchlist', watchlistRoutes);

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});