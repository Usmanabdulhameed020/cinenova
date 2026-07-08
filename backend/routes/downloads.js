const express = require('express');
const router = express.Router();
const MovieDownload = require('../models/MovieDownload');

// CREATE a new download link (You would use this via Postman or an Admin Dashboard to link your Firebase videos)
router.post('/', async (req, res) => {
  try {
    const newDownload = new MovieDownload(req.body);
    const savedDownload = await newDownload.save();
    res.status(201).json(savedDownload);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: "This exact download configuration already exists." });
    }
    res.status(500).json({ error: err.message });
  }
});

// GET download link for a Movie
router.get('/movie/:tmdbId', async (req, res) => {
  try {
    const { language = 'English' } = req.query;
    const download = await MovieDownload.findOne({ 
      tmdbId: req.params.tmdbId, 
      type: 'movie',
      language: language
    });
    
    if (!download) return res.status(404).json({ message: 'Movie not available for download in this language yet.' });
    res.status(200).json(download);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET download link for a TV Episode
router.get('/tv/:tmdbId/season/:season/episode/:episode', async (req, res) => {
  try {
    const { language = 'English' } = req.query;
    const download = await MovieDownload.findOne({ 
      tmdbId: req.params.tmdbId, 
      type: 'tv',
      seasonNumber: parseInt(req.params.season),
      episodeNumber: parseInt(req.params.episode),
      language: language
    });
    
    if (!download) return res.status(404).json({ message: 'Episode not available for download in this language yet.' });
    res.status(200).json(download);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
