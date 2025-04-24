
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const telemetryRouter = require('./routes/telemetry');
const readingsRouter  = require('./routes/readings');
const configRouter    = require('./routes/config');

const app = express();
app.use(express.json());

// Connect to Mongo
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    retryWrites: true,
    w: 'majority',
    appName: 'Cluster0'
  })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('Mongo error:', err));

// Mount routes
app.use('/api/telemetry', telemetryRouter);
app.use('/api/readings',   readingsRouter);
app.use('/api/config',     configRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

