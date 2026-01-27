'use client';
import Header from '@/components/Header';
import { useState } from 'react';
import { api } from '@/lib/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

            <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px', color: 'var(--text-muted)' }}>
              Don&apos;t have an account? <a href="/signup" style={{ color: 'var(--secondary)', fontWeight: 600 }}>Create one</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
