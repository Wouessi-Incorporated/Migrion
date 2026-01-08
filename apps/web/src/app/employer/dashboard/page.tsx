'use client';
import Header from '@/components/Header';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function EmployerDash() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [purchaseId, setPurchaseId] = useState('');
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
    fetchData(t);
  }, []);

  async function fetchData(t: string) {
    try {
      const [prod, cand, me] = await Promise.all([
        api('/v1/employer/interview-products', 'GET', undefined, t),
        api('/v1/employer/candidates', 'GET', undefined, t),
        api('/v1/me', 'GET', undefined, t)
      ]);
      setProducts(prod);
      setCandidates(cand.candidates || []);
      setInterviews(me.employer?.interviews || []);
      // Extract a valid purchase if available for the mock demo
      if (me.employer?.purchases?.length > 0) {
        setPurchaseId(me.employer.purchases[0].id);
      }
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
      setPurchaseId(r.purchaseId);
      await fetchData(token);
    } catch (e: any) {
      showMsg(e.data?.error || 'Purchase failed', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function schedule() {
    if (!candidateId || !purchaseId) return showMsg('Requirement: Candidate ID + Paid Credit', 'error');
    setLoading(true);
    try {
      await api('/v1/employer/schedule-interview', 'POST', {
        candidateId,
        scheduledAt: new Date(Date.now() + 86400000).toISOString(),
        durationMin: 45,
        purchaseId
      }, token);
      showMsg('Interview scheduled successfully!', 'success');
      setCandidateId('');
      await fetchData(token);
    } catch (e: any) {
      showMsg(e.data?.error || 'Scheduling failed', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function submitOutcome(interviewId: string, outcome: 'validated' | 'rejected') {
    setLoading(true);
    try {
      await api('/v1/employer/interview-outcome', 'POST', { interviewId, outcome, notes: 'Migration ready according to interview.' }, token);
      showMsg(`Candidate ${outcome === 'validated' ? 'Validated' : 'Rejected'}.`, 'success');
      await fetchData(token);
    } catch (e: any) {
      showMsg(e.data?.error || 'Outcome submission failed', 'error');
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
              <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--secondary)' }}>{purchaseId ? '1 Active' : '0 Credits'}</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
          {/* Main Marketplace Area */}
          <div>
            <div className="card" style={{ marginBottom: '24px' }}>
              <h3 style={{ marginTop: 0 }}>Available Candidates</h3>
              {candidates.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', background: '#F8FAFC', borderRadius: '12px' }}>
                  No candidates currently in the validation phase.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {candidates.map(c => (
                    <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '20px', border: '1px solid var(--border)', borderRadius: '12px', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <div style={{ width: '48px', height: '48px', background: '#eee', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>👤</div>
                        <div>
                          <div style={{ fontWeight: 700 }}>Migration Ready Candidate</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Target: {c.destination?.toUpperCase()} • ID: {c.id.slice(0, 8)}...</div>
                        </div>
                      </div>
                      <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }} onClick={() => { setCandidateId(c.id); showMsg('Candidate selected.', 'info'); }}>Select for Interview</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card" style={{ marginBottom: '24px' }}>
              <h3 style={{ marginTop: 0 }}>My Interviews</h3>
              {interviews.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No interviews scheduled yet.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {interviews.map(i => (
                    <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', border: '1px solid var(--border)', borderRadius: '8px' }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>Interview with {i.candidateId.slice(0, 8)}</div>
                        <div style={{ fontSize: '12px' }}>{new Date(i.scheduledAt).toLocaleString()}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {i.outcome ? (
                          <span className={`status-badge ${i.outcome === 'validated' ? 'status-done' : 'status-blocked'}`}>{i.outcome.toUpperCase()}</span>
                        ) : (
                          <>
                            <button className="btn-secondary" style={{ padding: '4px 12px', fontSize: '12px' }} onClick={() => submitOutcome(i.id, 'validated')}>Validate</button>
                            <button className="btn-outline" style={{ padding: '4px 12px', fontSize: '12px' }} onClick={() => submitOutcome(i.id, 'rejected')}>Reject</button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
              <h3 style={{ marginTop: 0 }}>Scheduler</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Book a session with the selected candidate.</p>

              <div style={{ marginTop: '20px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Candidate ID</label>
                <input
                  className="input"
                  value={candidateId}
                  readOnly
                  placeholder="Select from list"
                  style={{ marginBottom: '16px', background: '#f5f5f5' }}
                />

                <button
                  className="btn-primary"
                  style={{ width: '100%' }}
                  disabled={loading || !candidateId || !purchaseId}
                  onClick={schedule}
                >
                  {loading ? 'Processing...' : 'Book Interview'}
                </button>
              </div>

              {msg.text && (
                <div style={{
                  marginTop: '16px',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  background: msg.type === 'error' ? '#FFD1D1' : msg.type === 'success' ? '#D1F2E1' : '#E3F2FD',
                  color: msg.type === 'error' ? '#8F0000' : msg.type === 'success' ? '#006D35' : '#193044'
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
