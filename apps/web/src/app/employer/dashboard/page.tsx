'use client';
import Header from '@/components/Header';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function EmployerDash() {
  const [token, setToken] = useState('');
  const [products, setProducts] = useState<any>(null);
  const [candidateId, setCandidateId] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  useEffect(() => {
    const t = localStorage.getItem('token') || '';
    if (!t) {
      window.location.href = '/login';
      return;
    }
    setToken(t);
    fetchProducts(t);
  }, []);

  async function fetchProducts(t: string) {
    try {
      const r = await api('/v1/employer/interview-products', 'GET', undefined, t);
      setProducts(r);
    } catch (e) { }
  }

  const showMsg = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 5000);
  };

  async function buy(sku: string) {
    setLoading(true);
    try {
      const r = await api('/v1/employer/buy', 'POST', { sku }, token);
      showMsg(`Product ${sku} purchased. Credits active.`, 'success');
      // In real app, we'd store the purchaseId in local state or refetch balance
    } catch (e: any) {
      showMsg(e.data?.error || 'Purchase failed', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Header />

      <main style={{ maxWidth: 1100, margin: '40px auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '32px', margin: 0 }}>Validated Talent Marketplace</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Hire with certainty. Only pre-screened, migration-ready candidates.</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ textAlign: 'right', padding: '10px 20px', background: '#fff', border: '1px solid var(--border)', borderRadius: '12px' }}>
              <div style={{ fontSize: '10px', textTransform: 'uppercase', opacity: 0.6 }}>Active Credits</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--secondary)' }}>3 Interviews</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
          {/* Main Marketplace Area */}
          <div>
            <div className="card" style={{ marginBottom: '24px' }}>
              <h3 style={{ marginTop: 0 }}>Available Candidates</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>Candidates listed here have completed Phase 1 (Eligibility) and paid Phase 2 (Validation Fee).</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Mocked Candidate Row */}
                {[1, 2].map(i => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '20px', border: '1px solid var(--border)', borderRadius: '12px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <div style={{ width: '48px', height: '48px', background: '#eee', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>👤</div>
                      <div>
                        <div style={{ fontWeight: 700 }}>Senior Software Engineer</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Experience: 8 Years • Score: 92/100</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span className="status-badge" style={{ background: '#E3F2FD', color: '#1991DF' }}>UK Ready</span>
                      <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }} onClick={() => showMsg('Candidate ID copied to clipboard. Use schedule tool.', 'info')}>View Profile</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 style={{ marginTop: 0 }}>Interview Store</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                {products?.items?.map((item: any) => (
                  <div key={item.sku} style={{ padding: '20px', border: '1px solid var(--border)', borderRadius: '12px', textAlign: 'center' }}>
                    <div style={{ fontWeight: 800, fontSize: '18px', marginBottom: '4px' }}>{item.minutes ? `${item.minutes}m Session` : item.label}</div>
                    <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--primary)', marginBottom: '16px' }}>${(item.priceCents / 100).toFixed(2)}</div>
                    <button className="btn-secondary" onClick={() => buy(item.sku)} style={{ width: '100%', padding: '8px' }} disabled={loading}>Purchase</button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Tools */}
          <div>
            <div className="card" style={{ position: 'sticky', top: '100px' }}>
              <h3 style={{ marginTop: 0 }}>Schedule Tool</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Paste the Candidate ID to book a live video interview session.</p>

              <div style={{ marginTop: '20px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Candidate ID</label>
                <input
                  className="input"
                  value={candidateId}
                  onChange={e => setCandidateId(e.target.value)}
                  placeholder="00000000-0000-0000..."
                  style={{ marginBottom: '16px' }}
                />

                <button
                  className="btn-primary"
                  style={{ width: '100%' }}
                  onClick={() => showMsg('System requires a valid purchaseId. Please buy an interview credit first.', 'error')}
                >
                  Book Interview
                </button>
              </div>

              {msg.text && (
                <div style={{
                  marginTop: '16px',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  background: msg.type === 'error' ? '#FFD1D1' : '#D1F2E1',
                  color: msg.type === 'error' ? '#8F0000' : '#006D35'
                }}>
                  {msg.text}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
