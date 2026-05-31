import React from 'react';

export default function Home() {
  return (
    <div style={{ padding: '50px', fontFamily: 'system-ui' }}>
      <h1>AceProxy Global Command Center</h1>
      <p>Welcome, Commander. Here is your real-time arbitrage dashboard.</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginTop: '30px' }}>
        <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '12px' }}>
          <h3>Jakarta Station (JKT)</h3>
          <p style={{ color: '#52c41a' }}>Status: ONLINE</p>
          <p>Active Category: Ramadan Essentials</p>
        </div>
        <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '12px' }}>
          <h3>London Station (LDN)</h3>
          <p style={{ color: '#52c41a' }}>Status: ONLINE</p>
          <p>Active Category: Daily Essentials</p>
        </div>
        <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '12px' }}>
          <h3>Vault Security</h3>
          <p style={{ color: '#52c41a' }}>Status: SECURE</p>
          <p>Loss Prevention: 0.12% (Safe)</p>
        </div>
      </div>

      <div style={{ marginTop: '50px' }}>
        <h2>Live Profit Pulse</h2>
        <div style={{ height: '200px', background: '#f9f9f9', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>Rp 12,450,000 Total Profit</p>
        </div>
      </div>
    </div>
  );
}
