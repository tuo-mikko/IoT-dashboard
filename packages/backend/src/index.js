
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const telemetryRouter = require('./routes/telemetry');
const readingsRouter  = require('./routes/readings');   
const configRouter    = require('./routes/config');

const app = express();

const originalUse = app.use.bind(app);

app.use = function (routePath, ...rest) {
  // Only log if first arg is a string (functions/static middle-ware skipped)
  if (typeof routePath === 'string') console.log('Mounting:', routePath);
  return originalUse(routePath, ...rest);
};


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

const path = require('path');

const buildPath = path.join(__dirname, '..', '..', 'frontend', 'build');

app.use('/', express.static(buildPath));

app.get(/^\/(?!api).*/, (_req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

