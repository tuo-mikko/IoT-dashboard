// models/Reading.js
const mongoose = require('mongoose');

const readingSchema = new mongoose.Schema({
  timestamp:   { type: Date, required: true },
  temperature: Number,
  humidity:    Number,
  light:       Number,
  water:       Number,
  actions: [{
    timestamp: { type: Date, required: true },
    actions:   [String]
  }]
});

module.exports = mongoose.model('Reading', readingSchema);