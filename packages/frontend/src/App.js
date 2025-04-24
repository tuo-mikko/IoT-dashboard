// packages/frontend/src/App.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MetricChart from './components/MetricChart';
import ConfigForm  from './components/ConfigForm';

export default function App() {
  const [config, setConfig] = useState(null);   // ← single source-of-truth

  // Load once at startup
  useEffect(() => {
    axios.get('/api/config').then(res => setConfig(res.data));
  }, []);

  // Callback passed to ConfigForm
  const handleConfigSave = saved => setConfig(saved);

  if (!config) return <p>Loading…</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Vertical Farm Dashboard</h1>
      <MetricChart ranges={config.acceptable_ranges} />
      <ConfigForm config={config} onSave={handleConfigSave} />
    </div>
  );
}
