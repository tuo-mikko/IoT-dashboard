// routes/telemetry.js
const express = require('express');
const router  = express.Router();
const Reading = require('../models/Reading');
const Config  = require('../models/Config');

router.post('/data', async (req, res) => {
  const { timestamp, temperature, humidity, light, water, actions } = req.body;

  try {
    const newReading = new Reading({
      timestamp: new Date(timestamp),
      temperature,
      humidity,
      light,
      water,
      actions: actions?.map(a => ({
        timestamp: new Date(a.timestamp),
        actions:   a.actions
      }))
    });
    await newReading.save();

    console.log(`Telemetry saved: ${timestamp} | actions=${actions?.length || 0}`);

    // check config update as usual
    const config = await Config.findOne().sort({ updatedAt: -1 });
    const needsUpdate = config ? config.updatedAt > Date.now() - 60000 : false;

    res.json({
      config_update: needsUpdate,
      ...(needsUpdate && { new_config: config })
    });
  } catch (error) {
    console.error('Error saving telemetry:', error);
    res.status(500).json({ error: 'Failed to save telemetry' });
  }
});

module.exports = router;
