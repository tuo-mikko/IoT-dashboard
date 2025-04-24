// models/Config.js
const mongoose = require('mongoose');

const configSchema = new mongoose.Schema({
  acceptable_ranges: {
    temperature: { min: Number, max: Number },
    humidity:    { min: Number, max: Number },
    light:       { min: Number, max: Number },
    water:       { dry: Number, wet: Number }
  },
  read_interval_ms: { type: Number, default: 5000 },
  decision_interval_s: { type: Number, default: 30 },
  telemetry_interval_s: { type: Number, default: 60 },
  updatedAt:        { type: Date, default: Date.now }
});

module.exports = mongoose.model('Config', configSchema);