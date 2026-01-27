'use client';
import Header from '@/components/Header';
import Link from 'next/link';

async function getDest() {
  try {
    const r = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000') + '/v1/public/destinations', {
      cache: 'no-store',
      next: { revalidate: 0 }
    }).catch(() => null);

    if (!r) return [];
    if (!r.ok) return [];

    const data = await r.json();
    return data.dest || [];
  } catch (e) {
    console.error('Fetch error:', e);
    return [];
  }
}

export default async function Countries() {
  const dest = await getDest();
  const apiError = dest.length === 0;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Header />
      <div style={{
        padding: '60px 24px',
        background: 'linear-gradient(135deg, #001E3C 0%, #193044 100%)',
        color: 'white',
        textAlign: 'center',
        marginBottom: '40px'
      }}>
        <h1 style={{ fontSize: '48px', margin: 0 }}>Global Destinations</h1>
        <p style={{ opacity: 0.8, marginTop: '10px' }}>Explore active migration pathways supported by MIGRION™ infrastructure.</p>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 60px' }}>
        {apiError ? (
          <div style={{ textAlign: 'center', padding: '100px 24px', background: 'white', borderRadius: '24px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '48px', marginBottom: '24px' }}>🌐</div>
            <h2 style={{ color: 'var(--primary)' }}>Destinations Temporarily Offline</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto' }}>
              We are currently updating our destination marketplace. Please check back in a few minutes or contact support if the issue persists.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {dest.map((d: any) => (
              <Link key={d.slug} href={`/countries/${d.slug}`} style={{ textDecoration: 'none' }}>
                <div className="card" style={{
                  height: '100%',
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '16px' }}>📍</div>
                  <h3 style={{ margin: '0 0 8px 0', color: 'var(--primary)' }}>{d.name}</h3>
                  <div className="status-badge status-done" style={{ display: 'inline-block', marginBottom: '12px' }}>{d.region}</div>
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    Active labor demand matched for this region. Employer validation cycles currently open.
                  </p>
                  <div style={{ marginTop: '20px', fontWeight: 700, color: 'var(--secondary)', display: 'flex', alignItems: 'center' }}>
                    Explore Pathway <span style={{ marginLeft: '8px' }}>→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

