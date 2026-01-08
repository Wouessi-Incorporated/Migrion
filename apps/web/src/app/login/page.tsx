'use client';
import Header from '@/components/Header';
import { useState } from 'react';
import { api } from '@/lib/api';

export default function Login() {
  const [email, setEmail] = useState('candidate@migrion.local');
  const [password, setPassword] = useState('ChangeMeNow123!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit() {
    setError('');
    setLoading(true);
    try {
      const r = await api('/v1/auth/login', 'POST', { email, password });
      localStorage.setItem('token', r.token);
      localStorage.setItem('role', r.role);

      const dashboard = r.role === 'employer' ? '/employer/dashboard' :
        r.role === 'admin' ? '/admin/audit' :
          '/candidate/dashboard';

      window.location.href = dashboard;
    } catch (e: any) {
      setError(e.data?.error || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <Header />

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div className="card" style={{ width: '100%', maxWidth: '420px', padding: '40px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 style={{ fontSize: '28px', margin: '0 0 8px 0' }}>Welcome back</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Access your migration infrastructure.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px', color: 'var(--primary)' }}>Email Address</label>
              <input
                className="input"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="email@example.com"
                type="email"
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px', color: 'var(--primary)' }}>Password</label>
              <input
                className="input"
                value={password}
                onChange={e => setPassword(e.target.value)}
                type="password"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div style={{ padding: '12px', background: '#FFD1D1', color: '#8F0000', borderRadius: '8px', fontSize: '13px', fontWeight: 500 }}>
                {error}
              </div>
            )}

            <button
              className="btn-primary"
              onClick={submit}
              disabled={loading}
              style={{ width: '100%', marginTop: '8px', padding: '14px' }}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>

            <div style={{ marginTop: '20px', padding: '16px', background: '#F8F9FA', borderRadius: '12px', border: '1px solid #eee' }}>
              <div style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', opacity: 0.5, marginBottom: '8px', letterSpacing: '0.5px' }}>Seed Accounts</div>
              <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div onClick={() => { setEmail('candidate@migrion.local'); setPassword('ChangeMeNow123!'); }} style={{ cursor: 'pointer', color: 'var(--secondary)', textDecoration: 'underline' }}>Candidate Access</div>
                <div onClick={() => { setEmail('employer@migrion.local'); setPassword('ChangeMeNow123!'); }} style={{ cursor: 'pointer', color: 'var(--secondary)', textDecoration: 'underline' }}>Employer Access</div>
                <div onClick={() => { setEmail('admin@migrion.local'); setPassword('ChangeMeNow123!'); }} style={{ cursor: 'pointer', color: 'var(--secondary)', textDecoration: 'underline' }}>Admin Access</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
