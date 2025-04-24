const mongoose = require('mongoose');

const configSchema = new mongoose.Schema({
  acceptable_ranges: {
    temperature: { min: Number, max: Number },
    humidity: { min: Number, max: Number },
    light: { min: Number, max: Number },
    water: { dry: Number, wet: Number }
  },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Config', configSchema);