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

router.get('/actions', async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  try {
    const readings = await Reading.find({ actions: { $exists: true, $ne: [] } })
      .sort({ timestamp: -1 })
      .limit(limit);

    // Flatten actions array
    const actionsList = readings.flatMap(r =>
      r.actions.map(a => ({
        readingTimestamp: r.timestamp,
        actionTimestamp: a.timestamp,
        actions: a.actions
      }))
    )
    .sort((a, b) => new Date(b.actionTimestamp) - new Date(a.actionTimestamp))
    .slice(0, limit); // keep only latest N flattened actions

    res.json(actionsList);
  } catch (err) {
    console.error('Error fetching actions:', err);
    res.status(500).json({ error: 'Failed to fetch actions' });
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