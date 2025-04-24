const express = require('express');
const router = express.Router();
const Reading = require('../models/Reading');
const Config = require('../models/Config');

// POST /api/telemetry/data
router.post('/data', async (req, res) => {
  const { timestamp, temperature, humidity, light, water } = req.body;

  try {
    // Save data
    const newReading = new Reading({
      timestamp: new Date(timestamp),
      temperature,
      humidity,
      light,
      water
    });
    await newReading.save();

    console.log(`Telemertry saved at ${timestamp}: Temp=${temperature}, Hum=${humidity}, Light=${light}, Water=${water}`);

    // Check for config updates
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