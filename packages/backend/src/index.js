const express = require('express');
const mongoose = require('mongoose');
const telemetryRoutes = require('./routes/telemetry');

const app = express();
app.use(express.json()); 
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Routes
app.use('/api/telemetry', telemetryRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));