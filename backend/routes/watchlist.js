const express = require('express');
const router = express.Router();
const Watchlist = require('../models/Watchlist');

// GET all items for a user
router.get('/:userId', async (req, res) => {
  try {
    const items = await Watchlist.find({ userId: req.params.userId }).sort({ addedAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ADD an item
router.post('/', async (req, res) => {
  console.log('POST /api/watchlist - Body:', req.body);
  const item = new Watchlist({
    userId: req.body.userId,
    movieId: String(req.body.movieId),
    title: req.body.title,
    posterPath: req.body.posterPath,
    mediaType: req.body.mediaType,
  });

  try {
    const newItem = await item.save();
    console.log('Successfully saved to watchlist:', newItem._id);
    res.status(201).json(newItem);
  } catch (err) {
    console.error('Error saving to watchlist:', err);
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Movie already in watchlist' });
    }
    res.status(400).json({ message: err.message });
  }
});

// UPDATE an item (e.g. status)
router.put('/:id', async (req, res) => {
  try {
    const updatedItem = await Watchlist.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(updatedItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE an item
router.delete('/:id', async (req, res) => {
  try {
    await Watchlist.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted from watchlist' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE all items for a user
router.delete('/user/:userId', async (req, res) => {
  try {
    const result = await Watchlist.deleteMany({ userId: req.params.userId });
    res.json({ message: 'Watchlist cleared', deletedCount: result.deletedCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
