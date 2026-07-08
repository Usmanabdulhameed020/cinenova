const mongoose = require('mongoose');

const movieDownloadSchema = new mongoose.Schema({
  tmdbId: {
    type: String,
    required: true,
  },
  type: {
    type: String, // 'movie' or 'tv'
    required: true,
  },
  seasonNumber: {
    type: Number,
    required: false,
  },
  episodeNumber: {
    type: Number,
    required: false,
  },
  language: {
    type: String,
    default: 'English'
  },
  downloadUrl: {
    type: String, // The Firebase Storage URL
    required: true,
  }
}, { timestamps: true });

// Ensure we don't have duplicates for the exact same file
movieDownloadSchema.index({ tmdbId: 1, type: 1, seasonNumber: 1, episodeNumber: 1, language: 1 }, { unique: true });

module.exports = mongoose.model('MovieDownload', movieDownloadSchema);
