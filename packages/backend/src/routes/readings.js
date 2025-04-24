// routes/readings.js
const express = require('express');
const router = express.Router();
const Reading = require('../models/Reading');

// GET /api/readings?start=<ISO>&end=<ISO>&limit=<number>
router.get('/', async (req, res) => {
  try {
    const { start, end, limit = 1000 } = req.query;
    const query = {};
    if (start || end) {
      query.timestamp = {};
      if (start) query.timestamp.$gte = new Date(start);
      if (end)   query.timestamp.$lte = new Date(end);
    }
    const readings = await Reading.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit, 10));
    res.json(readings.reverse());  // oldest first
  } catch (err) {
    console.error('Error fetching readings:', err);
    res.status(500).json({ error: 'Failed to fetch readings' });
  }
});

// GET /api/readings/latest
router.get('/latest', async (req, res) => {
  try {
    const latest = await Reading.findOne().sort({ timestamp: -1 });
    if (!latest) return res.status(404).json({ error: 'No readings found' });
    res.json(latest);
  } catch (err) {
    console.error('Error fetching latest reading:', err);
    res.status(500).json({ error: 'Failed to fetch latest reading' });
  }
});

module.exports = router;
