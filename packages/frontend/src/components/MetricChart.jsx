// packages/frontend/src/components/MetricChart.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart, Line, CartesianGrid, XAxis, YAxis,
  Tooltip, ResponsiveContainer, ReferenceArea
} from 'recharts';

/* metric definitions */
const METRICS = [
  { key: 'temperature', label: 'Temperature (°C)', color: '#ef4444' }, // red-500
  { key: 'humidity',    label: 'Humidity (%)',     color: '#3b82f6' }, // blue-500
  { key: 'light',       label: 'Light',            color: '#f59e0b' }  // amber-500
];

/* helper for formatting server readings */
function fmt(rs) {
  return rs.map(r => ({
    time: new Date(r.timestamp).toLocaleTimeString(),
    temperature: r.temperature,
    humidity:    r.humidity,
    light:       r.light
  }));
}

export default function MetricChart({ ranges }) {
  const [metric, setMetric] = useState('temperature');
  const [data,   setData]   = useState([]);

  /* initial load (last 50) */
  useEffect(() => {
    axios.get('/api/readings?limit=50')
      .then(res => setData(fmt(res.data)))
      .catch(console.error);
  }, []);

  /* live polling every 5 s */
  useEffect(() => {
    const id = setInterval(() => {
      axios.get('/api/readings?limit=1')
        .then(res => {
          const p = fmt(res.data)[0];
          setData(d => {
            if (!p || !d.length) return d;
            return d[d.length - 1].time === p.time ? d : [...d.slice(-49), p];
          });
        })
        .catch(() => {});
    }, 5000);
    return () => clearInterval(id);
  }, []);

  /* band + domain logic exactly as in the version you said worked */
  const band     = ranges?.[metric];
  const hasBand  = band && typeof band.min === 'number' && typeof band.max === 'number';

  const values   = data.map(d => d[metric]).filter(v => v != null);
  const dataMin  = Math.min(...values);
  const dataMax  = Math.max(...values);

  let domain;
  if (hasBand && dataMin < Infinity) {
    const lower = Math.min(band.min, dataMin);
    const upper = Math.max(band.max, dataMax);
    const pad   = (upper - lower) * 0.1;
    domain = [lower - pad, upper + pad];
  } else {
    domain = ['auto', 'auto'];
  }

  const meta = METRICS.find(m => m.key === metric);

  /* ------------------------------- render */
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
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </section>
  );
}
