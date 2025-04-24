import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function RecentActions() {
  const [actions, setActions] = useState([]);

  useEffect(() => {
    fetchActions();
    const id = setInterval(fetchActions, 5000);  // refresh every 5 s
    return () => clearInterval(id);
  }, []);

  const fetchActions = () => {
    axios.get('/api/readings/actions?limit=10')
      .then(res => setActions(res.data))
      .catch(console.error);
  };

  return (
    <section style={{ marginTop: 32 }}>
      <h2>Recent Actions</h2>
      {actions.length === 0 ? (
        <p>No actions taken yet.</p>
      ) : (
        <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
          {actions.map((a, idx) => (
            <li key={idx} style={{ marginBottom: 8 }}>
              <strong>{new Date(a.actionTimestamp).toLocaleTimeString()}</strong>
              &nbsp;→&nbsp;
              {a.actions.join(', ')}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
