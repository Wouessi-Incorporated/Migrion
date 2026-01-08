'use client';
import Header from '@/components/Header';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function CandidateDash() {
  const [token, setToken] = useState('');
  const [candidate, setCandidate] = useState<any>(null);
  const [dests, setDests] = useState<any[]>([]);
  const [tab, setTab] = useState(1);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  useEffect(() => {
    const t = localStorage.getItem('token') || '';
    if (!t) {
      window.location.href = '/login';
      return;
    }
    setToken(t);
    fetchData(t);
  }, []);

  async function fetchData(t: string) {
    try {
      const [d, me] = await Promise.all([
        api('/v1/public/destinations', 'GET', undefined, t),
        api('/v1/me', 'GET', undefined, t)
      ]);
      setDests(d.dest || []);
      if (me.ok && me.candidate) {
        setCandidate(me.candidate);
        setTab(me.candidate.currentPhase || 1);
      }
    } catch (e) {
      console.error('Failed to fetch dashboard data', e);
    }
  }

  const showMsg = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 5000);
  };

  async function pay(phase: number, amount: number) {
    setLoading(true);
    try {
      await api('/v1/candidate/pay-phase', 'POST', {
        phase,
        amountCents: amount,
        currency: 'USD',
        provider: 'stripe_mock'
      }, token);
      showMsg(`Payment for Phase ${phase} successful!`, 'success');
      await fetchData(token);
    } catch (e: any) {
      showMsg(e.data?.error || 'Payment failed', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function completePhase(phase: number) {
    setLoading(true);
    try {
      await api(`/v1/phase${phase}/complete`, 'POST', {}, token);
      showMsg(`Phase ${phase} verified and completed!`, 'success');
      await fetchData(token);
    } catch (e: any) {
      showMsg(e.data?.error || `Verification failed for Phase ${phase}`, 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Header />

      <main style={{ maxWidth: 1000, margin: '40px auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '32px', margin: 0 }}>Migration Command Center</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Manage your outcome-based migration pathway.</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span className="status-badge status-done">V13 Infrastructure Active</span>
          </div>
        </div>

        {/* Phase Progress Bar */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '40px' }}>
          {[1, 2, 3].map(p => (
            <div
              key={p}
              onClick={() => setTab(p)}
              style={{
                flex: 1,
                height: '60px',
                background: tab === p ? 'var(--primary)' : 'var(--white)',
                color: tab === p ? 'var(--white)' : 'var(--text)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                padding: '0 20px',
                cursor: 'pointer',
                border: '1px solid var(--border)',
                transition: 'all 0.2s'
              }}
            >
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: tab === p ? 'var(--secondary)' : '#eee',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '12px',
                fontSize: '12px',
                fontWeight: 900
              }}>{p}</div>
              <div style={{ fontWeight: 600 }}>Phase {p}</div>
            </div>
          ))}
        </div>

        {/* Feedback Message */}
        {msg.text && (
          <div style={{
            padding: '16px',
            borderRadius: '12px',
            background: msg.type === 'success' ? '#D1F2E1' : msg.type === 'error' ? '#FFD1D1' : '#E3F2FD',
            color: msg.type === 'success' ? '#006D35' : msg.type === 'error' ? '#8F0000' : '#193044',
            marginBottom: '24px',
            border: '1px solid currentColor',
            fontSize: '14px',
            fontWeight: 500
          }}>
            {msg.text}
          </div>
        )}

        {/* Phase Content */}
        <div className="card" style={{ minHeight: '400px' }}>
          {tab === 1 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ margin: 0 }}>Phase 1: Readiness & Positioning</h2>
                <span className={`status-badge ${candidate?.phase1Done ? 'status-done' : 'status-pending'}`}>
                  {candidate?.phase1Done ? 'Completed' : 'In Progress'}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div>
                  <h4 style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '1px' }}>Assessment Tasks</h4>
                  <ul style={{ padding: 0, listStyle: 'none', marginTop: '16px' }}>
                    <li style={{ padding: '12px 0', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Eligibility Scoring (AI)</span>
                      <span style={{ color: 'var(--secondary)', fontWeight: 700 }}>{candidate?.phase1Paid ? '88/100' : 'Locked'}</span>
                    </li>
                    <li style={{ padding: '12px 0', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Profession Mapping</span>
                      <span style={{ color: candidate?.phase1Paid ? '#006D35' : 'var(--text-muted)' }}>{candidate?.phase1Paid ? 'Matched' : 'Locked'}</span>
                    </li>
                    <li style={{ padding: '12px 0', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Personalized Roadmap</span>
                      <span style={{ color: candidate?.phase1Paid ? '#006D35' : 'var(--text-muted)' }}>{candidate?.phase1Paid ? 'Available' : 'Locked'}</span>
                    </li>
                  </ul>
                  {candidate?.phase1Paid && (
                    <div style={{ marginTop: '20px', padding: '16px', background: '#E3F2FD', borderRadius: '12px', fontSize: '13px' }}>
                      <b>Roadmap:</b> Document Verification → Employer Matching → Escrow Setup
                    </div>
                  )}
                </div>
                <div style={{ background: '#F8FAFC', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <h4 style={{ margin: '0 0 12px 0' }}>Financial Commitment</h4>
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Phase 1 covers initialization, AI processing, and readiness report.</p>
                  <div style={{ fontSize: '24px', fontWeight: 800, margin: '16px 0' }}>$499.00 <span style={{ fontSize: '14px', fontWeight: 400, opacity: 0.6 }}>USD</span></div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {!candidate?.phase1Paid ? (
                      <button className="btn-secondary" onClick={() => pay(1, 49900)} disabled={loading} style={{ flex: 1 }}>Pay Now</button>
                    ) : (
                      <button className="btn-primary" onClick={() => completePhase(1)} disabled={loading || candidate?.phase1Done} style={{ flex: 1 }}>
                        {candidate?.phase1Done ? 'Verified' : 'Verify & Complete'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 2 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ margin: 0 }}>Phase 2: Employer Validation</h2>
                <span className={`status-badge ${candidate?.phase2Done ? 'status-done' : (candidate?.phase1Done ? 'status-pending' : 'status-blocked')}`}>
                  {candidate?.phase2Done ? 'Completed' : (candidate?.phase1Done ? 'In Progress' : 'Locked')}
                </span>
              </div>
              <p style={{ color: 'var(--text-muted)' }}>Access live video interviews with verified international employers who pay to see your talent.</p>

              <div style={{ border: '1px dashed var(--border)', padding: '40px', textAlign: 'center', borderRadius: '12px', marginTop: '24px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤝</div>
                <h3 style={{ margin: 0 }}>Interview Marketplace</h3>
                <p style={{ maxWidth: '400px', margin: '8px auto 24px' }}>
                  {!candidate?.phase1Done ? 'Complete Phase 1 to unlock the marketplace.' : 'Your profile is active in the global talent pool.'}
                </p>
                <div style={{ fontSize: '24px', fontWeight: 800, margin: '16px 0' }}>$999.00 <span style={{ fontSize: '14px', fontWeight: 400, opacity: 0.6 }}>USD</span></div>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  {!candidate?.phase2Paid ? (
                    <button className="btn-secondary" onClick={() => pay(2, 99900)} disabled={loading || !candidate?.phase1Done}>Unlock Marketplace</button>
                  ) : (
                    <button className="btn-primary" onClick={() => completePhase(2)} disabled={loading || candidate?.phase2Done}>
                      {candidate?.phase2Done ? 'Validation Secured' : 'Submit for Final Validation'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {tab === 3 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ margin: 0 }}>Phase 3: Escrow & Relocation</h2>
                <span className={`status-badge ${candidate?.escrowFunded ? 'status-done' : (candidate?.phase2Done ? 'status-pending' : 'status-blocked')}`}>
                  {candidate?.escrowFunded ? 'Escrow Active' : (candidate?.phase2Done ? 'Awaiting Funds' : 'Locked')}
                </span>
              </div>

              <div className="card" style={{ background: '#001E3C', color: 'white', border: 'none' }}>
                <h3>Escrow Protection Infrastructure</h3>
                <p style={{ opacity: 0.8 }}>Funds are held independently and only released upon successful relocation milestones.</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginTop: '20px' }}>
                  <div style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', opacity: 0.6 }}>Milestone 1</div>
                    <div style={{ fontWeight: 600 }}>Visa Issued</div>
                  </div>
                  <div style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', opacity: 0.6 }}>Milestone 2</div>
                    <div style={{ fontWeight: 600 }}>Flight Booked</div>
                  </div>
                  <div style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', opacity: 0.6 }}>Milestone 3</div>
                    <div style={{ fontWeight: 600 }}>Landing Verified</div>
                  </div>
                </div>
                <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                  {!candidate?.phase3Paid ? (
                    <button className="btn-secondary" onClick={() => pay(3, 199900)} disabled={loading || !candidate?.phase2Done}>Confirm Escrow Slot</button>
                  ) : (
                    <button className="btn-outline" style={{ color: 'white' }} onClick={() => api('/v1/escrow/fund', 'POST', {}, token).then(() => { showMsg('Escrow Funded', 'success'); fetchData(token); })} disabled={candidate?.escrowFunded}>
                      {candidate?.escrowFunded ? 'Funded' : 'Fund Escrow (Mock)'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
