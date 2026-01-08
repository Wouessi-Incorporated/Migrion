'use client';
import Header from '@/components/Header';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function Audit() {
  const [token, setToken] = useState('');
  const [logs, setLogs] = useState<any[]>([]);
  useEffect(() => {
    const t = localStorage.getItem('token') || '';
    setToken(t);
    (async () => {
      try {
        const r = await api('/v1/admin/audit/export', 'GET', undefined, t);
        setLogs(r.logs || []);
      } catch (e) { }
    })();
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Header />
      <div style={{ maxWidth: 1200, margin: '40px auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '32px', margin: 0 }}>System Infrastructure Audit</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Real-time event stream from the MIGRION™ middleware.</p>
          </div>
          <button className="btn-outline" onClick={() => window.print()}>Export PDF</button>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '16px 24px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Event</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Timestamp</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Payload</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No audit events found. Log in as admin to see activity.</td>
                </tr>
              ) : (
                logs.map((l: any) => (
                  <tr key={l.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px 24px' }}>
                      <span className="status-badge" style={{ background: '#E3F2FD', color: 'var(--primary)', fontWeight: 700 }}>{l.event}</span>
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: '13px' }}>
                      {new Date(l.createdAt).toLocaleString()}
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <pre style={{ margin: 0, fontSize: '11px', background: '#F1F5F9', padding: '8px', borderRadius: '8px', maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {l.payload}
                      </pre>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
