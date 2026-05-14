const mongoose = require('mongoose');

const WatchlistSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  movieId: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  posterPath: {
    type: String
  },
  mediaType: {
    type: String,
    default: 'movie'
  },
  status: {
    type: String,
    enum: ['want_to_watch', 'watched'],
    default: 'want_to_watch'
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});

// Prevent duplicate movies for the same user
WatchlistSchema.index({ userId: 1, movieId: 1 }, { unique: true });

module.exports = mongoose.model('Watchlist', WatchlistSchema);
