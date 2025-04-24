// packages/frontend/src/components/ConfigForm.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function round1(x) {
  return typeof x === 'number' ? Math.round(x * 10) / 10 : x;
}

export default function ConfigForm({ config, onSave }) {
  /* keep a local, editable copy of the config */
  const [localCfg, setLocalCfg] = useState(config);
  const [status,   setStatus]   = useState({ ok: '', err: '' });

  /* if parent supplies a newer config later, sync it */
  useEffect(() => setLocalCfg(config), [config]);

  /* ---------------------------------------------------- helpers */
  /** mutate nested numeric property given "path.to.field" */
  const handleChange = (path, value) => {
    const num = Number(value);
    setLocalCfg(cfg => {
      const next = { ...cfg };
      const keys = path.split('.');
      let obj = next;
      keys.forEach((k, i) => {
        if (i === keys.length - 1) obj[k] = num;
        else obj = obj[k];
      });
      return next;
    });
    setStatus({ ok: '', err: '' });
  };

  /** build payload with 1-decimal rounding */
  const buildPayload = () => {
    const r = localCfg.acceptable_ranges;
    return {
      read_interval_ms:      round1(localCfg.read_interval_ms),
      decision_interval_s:   round1(localCfg.decision_interval_s),
      telemetry_interval_s:  round1(localCfg.telemetry_interval_s),
      acceptable_ranges: {
        temperature: { min: round1(r.temperature.min), max: round1(r.temperature.max) },
        humidity:    { min: round1(r.humidity.min),    max: round1(r.humidity.max) },
        light:       { min: round1(r.light.min),       max: round1(r.light.max) },
        water:       { dry: r.water.dry,               wet: r.water.wet }
      }
    };
  };

  /* ---------------------------------------------------- submit */
  const handleSubmit = e => {
    e.preventDefault();
    const payload = buildPayload();

    axios.put('/api/config', payload)
      .then(res => {
        onSave(res.data);                  // notify parent immediately
        setStatus({ ok: 'Saved!', err: '' });
      })
      .catch(() =>
        setStatus({ ok: '', err: 'Failed to save configuration' })
      );
  };

  /* ---------------------------------------------------- render */
  const r = localCfg.acceptable_ranges;

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 620, margin: '2rem auto' }}>
      <h2>Gateway Configuration</h2>

      {/* ─────────── intervals ─────────── */}
      <fieldset>
        <legend>Intervals</legend>

        <label>
          Read interval (ms):&nbsp;
          <input
            type="number"
            step="1"
            value={localCfg.read_interval_ms}
            onChange={e => handleChange('read_interval_ms', e.target.value)}
          />
        </label><br/><br/>

        <label>
          Decision interval (s):&nbsp;
          <input
            type="number"
            step="1"
            value={localCfg.decision_interval_s}
            onChange={e => handleChange('decision_interval_s', e.target.value)}
          />
        </label><br/><br/>

        <label>
          Telemetry interval (s):&nbsp;
          <input
            type="number"
            step="1"
            value={localCfg.telemetry_interval_s}
            onChange={e => handleChange('telemetry_interval_s', e.target.value)}
          />
        </label>
      </fieldset>

      {/* ─────────── ranges ─────────── */}
      <fieldset style={{ marginTop: 24 }}>
        <legend>Acceptable Ranges (rounded to 1 decimal)</legend>

        <div style={{ marginBottom: 12 }}>
          <strong>Temperature (°C):</strong><br/>
          Min&nbsp;
          <input
            type="number"
            step="0.1"
            value={r.temperature.min}
            onChange={e => handleChange('acceptable_ranges.temperature.min', e.target.value)}
          /> – 
          Max&nbsp;
          <input
            type="number"
            step="0.1"
            value={r.temperature.max}
            onChange={e => handleChange('acceptable_ranges.temperature.max', e.target.value)}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <strong>Humidity (%):</strong><br/>
          Min&nbsp;
          <input
            type="number"
            step="0.1"
            value={r.humidity.min}
            onChange={e => handleChange('acceptable_ranges.humidity.min', e.target.value)}
          /> – 
          Max&nbsp;
          <input
            type="number"
            step="0.1"
            value={r.humidity.max}
            onChange={e => handleChange('acceptable_ranges.humidity.max', e.target.value)}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <strong>Light:</strong><br/>
          Min&nbsp;
          <input
            type="number"
            step="0.1"
            value={r.light.min}
            onChange={e => handleChange('acceptable_ranges.light.min', e.target.value)}
          /> – 
          Max&nbsp;
          <input
            type="number"
            step="0.1"
            value={r.light.max}
            onChange={e => handleChange('acceptable_ranges.light.max', e.target.value)}
          />
        </div>

        <div>
          <strong>Water (dry/wet):</strong><br/>
          Dry&nbsp;
          <input
            type="number"
            step="1"
            value={r.water.dry}
            onChange={e => handleChange('acceptable_ranges.water.dry', e.target.value)}
          /> – 
          Wet&nbsp;
          <input
            type="number"
            step="1"
            value={r.water.wet}
            onChange={e => handleChange('acceptable_ranges.water.wet', e.target.value)}
          />
        </div>
      </fieldset>

      {/* ─────────── feedback & submit ─────────── */}
      <button type="submit" style={{ marginTop: 16 }}>Save Configuration</button>
      {status.ok  && <p style={{ color: 'green' }}>{status.ok}</p>}
      {status.err && <p style={{ color: 'red'   }}>{status.err}</p>}
    </form>
  );
}
