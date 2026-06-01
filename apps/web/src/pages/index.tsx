import React, { useState } from 'react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentRole, setCurrentRole] = useState('God Mode');

  const menuItems = [
    { id: 'dashboard', label: 'Overview', icon: '📊' },
    { id: 'ai_sourcing', label: 'AI Sentinel', icon: '🤖' },
    { id: 'hot_products', label: 'Hot List (Eid)', icon: '🔥' },
    { id: 'vision_qc', label: 'VisionQC 2.0', icon: '👁️' },
    { id: 'orders', label: 'Orders & Fulfillment', icon: '📦' },

    { id: 'sourcing', label: 'Global Sourcing', icon: '🌍' },
    { id: 'vault', label: 'Vault & Finance', icon: '💰' },
    { id: 'logistics', label: 'L3 Logistics', icon: '✈️' },
    { id: 'cms', label: 'Marketing CMS', icon: '🖼️' },
    { id: 'membership', label: 'Membership', icon: '💎' },
    { id: 'whatsapp', label: 'WhatsApp CRM', icon: '💬' },
    { id: 'partners', label: 'Partner Hub', icon: '🤝' },
  ];

  const roles = ['God Mode', 'Financial', 'Station Manager', 'Logistics Admin'];

  const renderContent = () => {
    switch (activeTab) {
      case 'ai_sourcing':
        return (
          <div style={{ padding: '24px' }}>
            <h2 style={{ color: '#F97316' }}>AI Sourcing Sentinel (Arbitrage Ops)</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
              {[
                { name: 'Baju Koko (Ramadan Special)', jkt_price: 'Rp 450k', cn_price: 'Rp 85k', profit: '+429%', confidence: 'High' },
                { name: 'LED Hanging Lights', jkt_price: 'Rp 120k', cn_price: 'Rp 15k', profit: '+700%', confidence: 'Medium' },
                { name: 'Vacuum Sealer Pro', jkt_price: 'Rp 850k', cn_price: 'Rp 320k', profit: '+165%', confidence: 'High' },
              ].map(op => (
                <div key={op.name} style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#94A3B8' }}>{op.confidence} Confidence</span>
                    <span style={{ background: '#F0FDF4', color: '#166534', fontSize: '11px', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>Active</span>
                  </div>
                  <h4 style={{ margin: '12px 0 8px' }}>{op.name}</h4>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
                    <div>
                      <p style={{ color: '#94A3B8' }}>JKT Market</p>
                      <p style={{ fontWeight: 'bold' }}>{op.jkt_price}</p>
                    </div>
                    <div>
                      <p style={{ color: '#94A3B8' }}>Factory Cost</p>
                      <p style={{ fontWeight: 'bold' }}>{op.cn_price}</p>
                    </div>
                    <div style={{ marginLeft: 'auto' }}>
                      <p style={{ color: '#F97316', fontWeight: '900', fontSize: '16px' }}>{op.profit}</p>
                    </div>
                  </div>
                  <button style={{ width: '100%', marginTop: '16px', padding: '8px', borderRadius: '8px', border: 'none', background: '#F97316', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>Unlock Sourcing Route</button>
                </div>
              ))}
            </div>
          </div>
        );
      case 'hot_products':
        return (
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ color: '#F97316' }}>Eid 2026 Hot Products</h2>
              <div style={{ display: 'flex', gap: '12px' }}>
                <span style={{ background: '#FEE2E2', color: '#991B1B', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }}>Node: JKT-EID-2026</span>
                <button style={{ background: '#1E293B', color: 'white', padding: '8px 16px', borderRadius: '8px', border: 'none', fontWeight: 'bold' }}>Broadcast to Partners</button>
              </div>
            </div>
            <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {[
                { id: 'EID-001', name: 'Premium Silk Hijab', cost: '¥12', price: 'Rp 99k', gain: '+234%', stock: 5000, sentinel: 'SAFE', patent: 'CLEAN' },
                { id: 'EID-002', name: 'Travel Mukena Pro', cost: '¥45', price: 'Rp 280k', gain: '+148%', stock: 1200, sentinel: 'ALERT', patent: 'CLEAN' },
                { id: 'EID-003', name: 'Smart Zikr Ring Gen2', cost: '¥85', price: 'Rp 450k', gain: '+103%', stock: 800, sentinel: 'SAFE', patent: 'CLEAN' },
                { id: 'EID-004', name: 'LED Moon Decor', cost: '¥18', price: 'Rp 150k', gain: '+180%', stock: 3000, sentinel: 'SAFE', patent: 'CLEAN' },
                { id: 'EID-006', name: 'Modern Baju Koko', cost: '¥55', price: 'Rp 320k', gain: '+155%', stock: 2500, sentinel: 'SAFE', patent: 'CLEAN' },
                { id: 'EID-009', name: 'Hakoba Eyelet Dress', cost: '¥85', price: 'Rp 420k', gain: '+210%', stock: 1500, sentinel: 'SAFE', patent: 'CLEAN' },
              ].map(p => (
                <div key={p.id} style={{ background: 'white', padding: '20px', borderRadius: '20px', border: p.sentinel === 'ALERT' ? '2px solid #EF4444' : '1px solid #E2E8F0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: '6px' }}>
                    {p.patent === 'CLEAN' && (
                      <span style={{ background: '#F0FDF4', color: '#166534', fontSize: '9px', padding: '2px 6px', borderRadius: '4px', fontWeight: '900', border: '1px solid #BBF7D0' }}>
                        🛡️ PATENT CLEAN
                      </span>
                    )}
                  </div>
                  {p.sentinel === 'ALERT' && (
                    <div style={{ position: 'absolute', top: -10, right: 10, background: '#EF4444', color: 'white', fontSize: '10px', padding: '4px 8px', borderRadius: '8px', fontWeight: '900', zIndex: 10 }}>
                      ⚠️ SENTINEL ALERT
                    </div>
                  )}
                  <div style={{ height: '140px', background: '#F8FAFC', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px' }}>
                    {p.name.includes('Hijab') ? '👗' : p.name.includes('Mukena') ? '🕋' : p.name.includes('Ring') ? '⌚' : p.name.includes('Dress') ? '👗' : p.name.includes('Koko') ? '👔' : '🏮'}
                  </div>
                  <div style={{ marginTop: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '11px', fontWeight: '800', color: '#94A3B8' }}>{p.id}</span>
                      <span style={{ color: '#16A34A', fontSize: '11px', fontWeight: '900' }}>{p.gain} PROFIT</span>
                    </div>
                    <h4 style={{ margin: '8px 0', fontSize: '15px' }}>{p.name}</h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                      <div>
                        <p style={{ fontSize: '10px', color: '#94A3B8', margin: 0 }}>Jakarta Price</p>
                        <p style={{ fontSize: '16px', fontWeight: '900', color: '#F97316', margin: 0 }}>{p.price}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '10px', color: '#94A3B8', margin: 0 }}>Stock</p>
                        <p style={{ fontSize: '12px', fontWeight: 'bold', margin: 0 }}>{p.stock} units</p>
                      </div>
                    </div>
                    {p.sentinel === 'ALERT' && (
                      <div style={{ marginTop: '12px', padding: '8px', background: '#FEF2F2', borderRadius: '8px', border: '1px solid #FEE2E2' }}>
                        <p style={{ fontSize: '10px', color: '#991B1B', margin: 0, fontWeight: '700' }}>Price Drift: +18.4% (1688 Alert)</p>
                        <p style={{ fontSize: '9px', color: '#B91C1C', margin: '2px 0 0 0' }}>Hot-standby supplier engaged.</p>
                      </div>
                    )}
                  </div>
                  <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                    <button style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white', fontSize: '12px', fontWeight: 'bold' }}>Edit CMS</button>
                    <button style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: '#F97316', color: 'white', fontSize: '12px', fontWeight: 'bold' }}>Push Live</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'vision_qc':
        return (
          <div style={{ padding: '24px' }}>
            <h2 style={{ color: '#F97316' }}>VisionQC 2.0 (AI Inspection Wall)</h2>
            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {[
                { orderId: 'ORD-1002', product: 'Silk Hijab Emerald', status: 'Flagged', diff: 'Color Mismatch (7%)', score: 0.88, cn_img: '🖼️ 1688 Spec', warehouse_img: '📸 Real Photo' },
                { orderId: 'ORD-1005', product: 'Vacuum Sealer Pro', status: 'Passed', diff: 'None', score: 0.99, cn_img: '🖼️ 1688 Spec', warehouse_img: '📸 Real Photo' },
              ].map(item => (
                <div key={item.orderId} style={{ background: 'white', borderRadius: '20px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                  <div style={{ padding: '16px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontWeight: '900', color: '#1E293B' }}>{item.orderId}</span>
                      <span style={{ marginLeft: '12px', fontSize: '13px', color: '#64748B' }}>{item.product}</span>
                    </div>
                    <span style={{ background: item.status === 'Passed' ? '#DCFCE7' : '#FEE2E2', color: item.status === 'Passed' ? '#166534' : '#991B1B', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
                      {item.status} (AI Score: {(item.score * 100).toFixed(0)})
                    </span>
                  </div>
                  {item.score < 0.85 && (
                    <div style={{ background: '#FFF7ED', padding: '12px 20px', borderBottom: '1px solid #FFEDD5', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '18px' }}>⚠️</span>
                      <p style={{ fontSize: '13px', color: '#9A3412', fontWeight: 'bold' }}>
                        Low Confidence Alert: AI score below 85. Manual verification required per Jakarta Ops Policy.
                      </p>
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '1px', background: '#E2E8F0' }}>
                    <div style={{ flex: 1, height: '280px', background: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ fontSize: '40px' }}>{item.cn_img.split(' ')[0]}</div>
                      <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '10px' }}>1688 Reference</p>
                    </div>
                    <div style={{ flex: 1, height: '280px', background: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                      <div style={{ fontSize: '40px' }}>{item.warehouse_img.split(' ')[0]}</div>
                      <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '10px' }}>Warehouse Snapshot</p>
                      
                      {/* Delta E Comparison Bar */}
                      <div style={{ position: 'absolute', bottom: '20px', width: '80%', background: 'rgba(255,255,255,0.9)', padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748B' }}>COLOR DELTA (ΔE)</span>
                          <span style={{ fontSize: '10px', fontWeight: '900', color: item.status === 'Passed' ? '#16A34A' : '#EF4444' }}>
                            ACTUAL: {item.status === 'Passed' ? '1.2' : '6.8'} / MAX: 5.0
                          </span>
                        </div>
                        <div style={{ height: '6px', background: '#F1F5F9', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ 
                            width: item.status === 'Passed' ? '24%' : '85%', 
                            height: '100%', 
                            background: item.status === 'Passed' ? '#10B981' : '#EF4444' 
                          }} />
                        </div>
                      </div>

                      {item.status === 'Flagged' && (
                        <div style={{ position: 'absolute', border: '3px solid #EF4444', width: '100px', height: '100px', borderRadius: '8px', top: '40px' }}>
                          <span style={{ position: 'absolute', top: '-25px', left: 0, background: '#EF4444', color: 'white', fontSize: '10px', padding: '2px 6px', borderRadius: '4px' }}>DIFF: {item.diff}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ padding: '16px', display: 'flex', gap: '12px' }}>
                    <button style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white', fontWeight: 'bold' }}>Manual Review</button>
                    <button style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: item.status === 'Passed' ? '#1E293B' : '#EF4444', color: 'white', fontWeight: 'bold' }}>
                      {item.status === 'Passed' ? 'Release to Export' : 'Initiate 1688 Return'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'orders':

        return (
          <div style={{ padding: '24px' }}>
            <h2 style={{ color: '#F97316' }}>Order Management Center</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '2px solid #F3F4F6' }}>
                  <th style={{ padding: '12px' }}>Order ID</th>
                  <th style={{ padding: '12px' }}>Status</th>
                  <th style={{ padding: '12px' }}>Region</th>
                  <th style={{ padding: '12px' }}>Sourcing Value</th>
                  <th style={{ padding: '12px' }}>Evidence</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { id: 'ORD-9921', status: 'In Transit', region: 'JKT', value: 'Rp 1,250k', audit: 'Verified' },
                  { id: 'ORD-9920', status: 'Purchased', region: 'JKT', value: 'Rp 850k', audit: 'Verified' },
                  { id: 'ORD-9919', status: 'Delivered', region: 'LDN', value: '£45.00', audit: 'Verified' },
                ].map((order) => (
                  <tr key={order.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>{order.id}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ padding: '4px 8px', borderRadius: '4px', background: '#FEF3C7', color: '#D97706', fontSize: '12px' }}>{order.status}</span>
                    </td>
                    <td style={{ padding: '12px' }}>{order.region}</td>
                    <td style={{ padding: '12px', color: '#16A34A', fontWeight: 'bold' }}>{order.value}</td>
                    <td style={{ padding: '12px', color: '#0EA5E9', fontSize: '12px' }}>{order.audit} ✅</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'cms':
        return (
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ color: '#F97316' }}>Marketing CMS (Drag & Drop)</h2>
              <button style={{ backgroundColor: '#F97316', color: 'white', padding: '8px 16px', borderRadius: '8px', border: 'none', fontWeight: 'bold' }}>+ New Banner</button>
            </div>
            <div style={{ marginTop: '20px', border: '2px dashed #CBD5E1', borderRadius: '16px', padding: '40px', textAlign: 'center', backgroundColor: 'white' }}>
              <p style={{ color: '#64748B', fontSize: '14px' }}>Drag and drop banner assets here to upload to Node: JKT-01</p>
              <button style={{ marginTop: '12px', padding: '8px 24px', borderRadius: '8px', border: '1px solid #E2E8F0', backgroundColor: 'white', fontWeight: '600' }}>Select File</button>
            </div>
            <div style={{ marginTop: '30px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {[
                { id: 'B-001', station: 'JKT', title: 'Ramadan Special', active: true, img: 'https://placehold.co/600x200/F97316/white?text=Ramadan+Raya' },
                { id: 'B-002', station: 'LDN', title: 'Summer Collection', active: false, img: 'https://placehold.co/600x200/0EA5E9/white?text=Summer+Vibes' },
              ].map(banner => (
                <div key={banner.id} style={{ border: '1px solid #E5E7EB', borderRadius: '16px', overflow: 'hidden', background: 'white', cursor: 'grab' }}>
                  <img src={banner.img} style={{ width: '100%', height: '120px', objectFit: 'cover' }} />
                  <div style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '12px', color: '#6B7280' }}>ID: {banner.id}</span>
                      <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: banner.active ? '#DCFCE7' : '#F3F4F6', color: banner.active ? '#166534' : '#6B7280' }}>
                        {banner.active ? 'Active' : 'Draft'}
                      </span>
                    </div>
                    <h4 style={{ margin: '8px 0' }}>{banner.title}</h4>
                    <p style={{ fontSize: '12px', color: '#9CA3AF' }}>Station: {banner.station}</p>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                      <button style={{ flex: 1, padding: '6px', fontSize: '12px', border: '1px solid #E5E7EB', borderRadius: '6px', background: 'white' }}>Edit</button>
                      <button style={{ padding: '6px', fontSize: '12px', border: '1px solid #FECACA', borderRadius: '6px', background: '#FEF2F2', color: '#DC2626' }}>Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'whatsapp':
        return (
          <div style={{ padding: '24px' }}>
            <h2 style={{ color: '#F97316' }}>WhatsApp CRM & Notifications</h2>
            <div style={{ marginTop: '20px', backgroundColor: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
              <h3>Integration Status: <span style={{ color: '#16A34A' }}>Connected</span></h3>
              <p style={{ color: '#64748B', fontSize: '14px' }}>Webhooks active for JKT Node</p>
              
              <div style={{ marginTop: '24px' }}>
                <h4 style={{ marginBottom: '12px' }}>Automated Message Templates</h4>
                {[
                  { name: 'Order Confirmation', status: 'Enabled' },
                  { name: 'In Transit Alert', status: 'Enabled' },
                  { name: 'Arrival at Hub', status: 'Enabled' },
                ].map(t => (
                  <div key={t.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #F3F4F6' }}>
                    <span>{t.name}</span>
                    <span style={{ color: '#16A34A', fontWeight: 'bold' }}>{t.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'membership':
        return (
          <div style={{ padding: '24px' }}>
            <h2 style={{ color: '#F97316' }}>Membership & Loyalty</h2>
            <div style={{ marginTop: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                {[
                  { level: 'Bronze', badge: '🥉', spend: 'Rp 0', discount: '0%', color: '#B45309' },
                  { level: 'Silver', badge: '🥈', spend: 'Rp 10M', discount: '5%', color: '#6B7280' },
                  { level: 'Gold', badge: '🥇', spend: 'Rp 50M', discount: '15%', color: '#D97706' },
                  { level: 'Platinum', badge: '💎', spend: 'Rp 200M', discount: '30%', color: '#1D4ED8' },
                ].map(l => (
                  <div key={l.level} style={{ padding: '20px', borderRadius: '16px', background: 'white', border: '1px solid #E5E7EB', textAlign: 'center' }}>
                    <div style={{ fontSize: '32px' }}>{l.badge}</div>
                    <h4 style={{ margin: '10px 0 5px', color: l.color }}>{l.level}</h4>
                    <p style={{ margin: 0, fontSize: '12px', color: '#6B7280' }}>Min. Spend: {l.spend}</p>
                    <div style={{ marginTop: '10px', fontSize: '14px', fontWeight: 'bold', color: '#16A34A' }}>{l.discount} Off Fee</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '32px' }}>
                <h3>Recent Level Upgrades</h3>
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E5E7EB', marginTop: '12px' }}>
                  {[
                    { user: 'Budi J.', from: 'Bronze', to: 'Silver', date: '2026-06-01' },
                    { user: 'Siti A.', from: 'Silver', to: 'Gold', date: '2026-05-30' },
                  ].map((log, i) => (
                    <div key={i} style={{ padding: '16px', borderBottom: i === 0 ? '1px solid #F3F4F6' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '600' }}>{log.user}</span>
                      <span style={{ fontSize: '12px' }}>
                        {log.from} → <span style={{ fontWeight: 'bold', color: '#F97316' }}>{log.to}</span>
                      </span>
                      <span style={{ fontSize: '12px', color: '#9CA3AF' }}>{log.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
        return (
          <div style={{ padding: '24px' }}>
            <h2 style={{ color: '#F97316' }}>Vault & Treasury Management</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
              <div style={{ padding: '24px', background: '#F0FDF4', borderRadius: '16px' }}>
                <p style={{ margin: 0, color: '#166534', fontWeight: 'bold' }}>Risk Buffer Balance</p>
                <h1 style={{ margin: '10px 0', color: '#15803d' }}>Rp 18,450,200</h1>
                <p style={{ margin: 0, fontSize: '12px', color: '#166534' }}>+1.5% from every transaction automatically ledgered</p>
              </div>
              <div style={{ padding: '24px', background: '#EFF6FF', borderRadius: '16px' }}>
                <p style={{ margin: 0, color: '#1E40AF', fontWeight: 'bold' }}>Total Resale Commission</p>
                <h1 style={{ margin: '10px 0', color: '#1D4ED8' }}>Rp 5,230,000</h1>
                <p style={{ margin: 0, fontSize: '12px', color: '#1E40AF' }}>5% C2C transaction fee revenue</p>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div style={{ padding: '24px' }}>
            <h1>Global Command Center</h1>
            <p>Welcome, Commander. Real-time sourcing insights across all stations.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginTop: '30px' }}>
              <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '12px', background: 'white' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#F97316' }}>Jakarta Pilot (JKT)</h3>
                <p style={{ color: '#52c41a', fontWeight: 'bold' }}>● ONLINE</p>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  <p>Active Category: Ramadan Essentials</p>
                  <p>Throughput: 842 parcels/day</p>
                  <p>L3 Logistics Gain: +34.2%</p>
                </div>
              </div>
              <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '12px', background: 'white' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#F97316' }}>London Hub (LDN)</h3>
                <p style={{ color: '#52c41a', fontWeight: 'bold' }}>● ONLINE</p>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  <p>Active Category: Daily Essentials</p>
                  <p>Throughput: 125 parcels/day</p>
                  <p>L3 Logistics Gain: +18.5%</p>
                </div>
              </div>
              <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '12px', background: '#F8FAFC' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#475569' }}>Vault & Security</h3>
                <p style={{ color: '#0EA5E9', fontWeight: 'bold' }}>🛡️ SECURE</p>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  <p>Risk Buffer: Rp 18,450,000</p>
                  <p>Chargeback Rate: 0.12%</p>
                  <p>Agent Sentinel: Active</p>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '50px', padding: '30px', background: '#FFF7ED', borderRadius: '24px', border: '1px solid #FFEDD5' }}>
              <h2 style={{ color: '#9A3412', marginTop: 0 }}>Jakarta Pilot Deployment</h2>
              <p style={{ color: '#C2410C' }}>Field testing for the 2026 Eid Al-Fitr surge is now active. APK for local partners:</p>
              <a 
                href="https://expo.dev/artifacts/eas/aceproxy-pilot-jakarta.apk" 
                style={{ 
                  backgroundColor: '#F97316', 
                  color: 'white', 
                  padding: '12px 24px', 
                  borderRadius: '12px', 
                  textDecoration: 'none', 
                  fontWeight: 'bold',
                  display: 'inline-block',
                  marginTop: '10px'
                }}
              >
                Download AceProxy Mobile (APK)
              </a>
            </div>
          </div>
        );
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'system-ui', backgroundColor: '#F9FAFB' }}>
      {/* Sidebar */}
      <div style={{ width: '260px', backgroundColor: 'white', borderRight: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #F3F4F6' }}>
          <h1 style={{ fontSize: '20px', fontWeight: '900', color: '#F97316', margin: 0 }}>AceProxy</h1>
          <p style={{ fontSize: '10px', color: '#9CA3AF', margin: '4px 0 0' }}>COMMAND CENTER v1.0</p>
        </div>
        <nav style={{ flex: 1, padding: '16px' }}>
          {menuItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 16px',
                borderRadius: '10px',
                cursor: 'pointer',
                marginBottom: '4px',
                backgroundColor: activeTab === item.id ? '#FFF7ED' : 'transparent',
                color: activeTab === item.id ? '#C2410C' : '#4B5563',
                fontWeight: activeTab === item.id ? 'bold' : '500',
              }}
            >
              <span style={{ marginRight: '12px', fontSize: '18px' }}>{item.icon}</span>
              {item.label}
            </div>
          ))}
        </nav>
        <div style={{ padding: '24px', borderTop: '1px solid #F3F4F6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '32px', height: '32px', backgroundColor: '#F97316', borderRadius: '50%' }}></div>
            <div>
              <p style={{ fontSize: '12px', fontWeight: 'bold', margin: 0 }}>Commander Boss</p>
              <p style={{ fontSize: '10px', color: '#9CA3AF', margin: 0 }}>Root Admin</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main style={{ flex: 1, overflowY: 'auto' }}>
        <header style={{ height: '70px', backgroundColor: 'white', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', padding: '0 32px', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '16px' }}>{menuItems.find(i => i.id === activeTab)?.label}</h3>
            <div style={{ background: '#F1F5F9', padding: '4px', borderRadius: '8px', display: 'flex', gap: '4px' }}>
              {roles.map(role => (
                <button 
                  key={role}
                  onClick={() => setCurrentRole(role)}
                  style={{ 
                    padding: '4px 12px', 
                    fontSize: '11px', 
                    border: 'none', 
                    borderRadius: '6px', 
                    backgroundColor: currentRole === role ? 'white' : 'transparent',
                    color: currentRole === role ? '#F97316' : '#64748B',
                    fontWeight: currentRole === role ? 'bold' : '500',
                    cursor: 'pointer',
                    boxShadow: currentRole === role ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
                  }}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <span style={{ color: '#16A34A', fontSize: '12px', fontWeight: 'bold' }}>● SYSTEM_NORMAL</span>
            <span style={{ color: '#4B5563', fontSize: '12px' }}>雅加达试点站 (JKT)</span>
          </div>
        </header>
        {renderContent()}
      </main>
    </div>
  );
}
