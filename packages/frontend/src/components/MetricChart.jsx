// packages/frontend/src/components/MetricChart.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea
} from 'recharts';

const METRICS = [
  { key: 'temperature', label: 'Temperature (°C)', color: '#ef4444' },
  { key: 'humidity',    label: 'Humidity (%)',    color: '#3b82f6' },
  { key: 'light',       label: 'Light (ADC)',     color: '#f59e0b' }
];

export default function MetricChart() {
  const [data, setData]     = useState([]);
  const [ranges, setRanges] = useState({});
  const [metric, setMetric] = useState('temperature');
  const [status, setStatus] = useState('loading'); // loading | error | ready

  useEffect(() => {
    (async () => {
      try {
        const [{ data: readings }, { data: cfg }] = await Promise.all([
          axios.get('/api/readings?limit=50'),
          axios.get('/api/config')
        ]);
        setRanges(cfg.acceptable_ranges || {});
        setData(
          readings.reverse().map(r => ({
            time: new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            temperature: r.temperature,
            humidity:    r.humidity,
            light:       r.light
          }))
        );
        setStatus('ready');
      } catch (err) {
        console.error(err);
        setStatus('error');
      }
    })();
  }, []);

  if (status === 'loading') return <p>Loading…</p>;
  if (status === 'error')   return <p style={{ color: 'red' }}>Failed to load data.</p>;

  const meta = METRICS.find(m => m.key === metric);
  const band = ranges[metric];
  const hasBand = band && typeof band.min === 'number' && typeof band.max === 'number';

  // Compute data extent
  const values = data.map(d => d[metric]).filter(v => v != null);
  const dataMin = Math.min(...values);
  const dataMax = Math.max(...values);

  // Determine domain: include both data and band, then pad by 10%
  let domain;
  if (hasBand && dataMin < Infinity) {
    const lower = Math.min(band.min, dataMin);
    const upper = Math.max(band.max, dataMax);
    const pad = (upper - lower) * 0.1;
    domain = [lower - pad, upper + pad];
  } else {
    domain = ['auto', 'auto'];
  }

  return (
    <section className="space-y-4">
      <label className="space-x-2 font-medium">
        Metric:
        <select
          className="border rounded px-2 py-1"
          value={metric}
          onChange={e => setMetric(e.target.value)}
        >
          {METRICS.map(m => (
            <option key={m.key} value={m.key}>{m.label}</option>
          ))}
        </select>
      </label>

      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" minTickGap={20} />
          <YAxis domain={domain} />
          <Tooltip />

          {hasBand && (
            <ReferenceArea
              y1={band.min}
              y2={band.max}
              fill={meta.color}
              fillOpacity={0.3}
            />
          )}

          <Line
            type="monotone"
            dataKey={metric}
            stroke={meta.color}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </section>
  );
}
