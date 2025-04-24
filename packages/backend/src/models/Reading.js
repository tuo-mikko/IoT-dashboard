const mongoose = require('mongoose');

const readingSchema = new mongoose.Schema({
  timestamp: { type: Date, required: true },
  temperature: Number,
  humidity: Number,
  light: Number,
  water: Number
});

module.exports = mongoose.model('Reading', readingSchema);