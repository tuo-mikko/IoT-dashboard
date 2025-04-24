const express = require('express');
const router = express.Router();
const Config = require('../models/Config');

// GET /api/config
router.get('/', async (req, res) => {
  try {
    const config = await Config.findOne().sort({ updatedAt: -1 });
    if (!config) return res.status(404).json({ error: 'No configuration found' });
    res.json(config);
  } catch (err) {
    console.error('Error fetching config:', err);
    res.status(500).json({ error: 'Failed to fetch config' });
  }
});

// PUT /api/config
router.put('/', async (req, res) => {
  try {
    const { acceptable_ranges, read_interval_ms } = req.body;
    const update = {};
    if (acceptable_ranges) update.acceptable_ranges = acceptable_ranges;
    if (read_interval_ms)    update.read_interval_ms = read_interval_ms;

    const config = await Config.findOneAndUpdate(
      {},
      { ...update, updatedAt: new Date() },
      { new: true, upsert: true }
    );
    console.log('✔ Config updated:', config);
    res.json(config);
  } catch (err) {
    console.error('Error updating config:', err);
    res.status(500).json({ error: 'Failed to update config' });
  }
});

module.exports = router;
