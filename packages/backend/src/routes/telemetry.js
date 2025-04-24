const express = require('express');
const router = express.Router();
const Reading = require('../models/Reading.js');
const Config = require('../models/Config');

// POST /api/telemetry
router.post('/', async (req, res) => {
  const { temperature, humidity, light, water } = req.body;

  // Save telemetry data
  const newReading = new Reading({
    timestamp: new Date(),
    temperature,
    humidity,
    light,
    water
  });
  await newReading.save();

  // Check for config updates
  const config = await Config.findOne().sort({ updatedAt: -1 });
  const needsUpdate = config ? config.updatedAt > Date.now() - 60000 : false;

  res.json({
    config_update: needsUpdate,
    ...(needsUpdate && { new_config: config })  
  });
});

module.exports = router;