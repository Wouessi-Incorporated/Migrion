import Header from '@/components/Header';
import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      {/* Hero Section */}
      <section style={{
        padding: '100px 24px',
        background: 'linear-gradient(135deg, #001E3C 0%, #193044 100%)',
        color: 'white',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Abstract background element */}
        <div style={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(25, 145, 223, 0.15) 0%, transparent 70%)',
          borderRadius: '50%'
        }} />

        <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <h1 style={{
            fontSize: 'clamp(40px, 8vw, 72px)',
            lineHeight: 1.1,
            marginBottom: '24px',
            background: 'linear-gradient(to right, #FFFFFF, #B0C4DE)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Move with certainty.
          </h1>
          <p style={{
            fontSize: 'clamp(18px, 3vw, 22px)',
            opacity: 0.9,
            marginBottom: '40px',
            lineHeight: 1.6,
            maxWidth: '700px',
            margin: '0 auto 40px'
          }}>
            The world's first outcome-based migration infrastructure. Secure your future with phase-locked execution and escrow protection.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/login" className="btn-secondary" style={{ padding: '16px 40px', fontSize: '18px' }}>
              Start Your Migration
            </Link>
            <Link href="/countries" className="btn-outline" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)', padding: '16px 40px', fontSize: '18px' }}>
              Explore Countries
            </Link>
          </div>
        </div>
      </section>

      {/* Logic Section */}
      <section style={{ padding: '80px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '36px', marginBottom: '60px' }}>The MIGRION™ Process</h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
          <div className="card">
            <div style={{ width: '40px', height: '40px', background: '#E3F2FD', color: '#1991DF', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', fontWeight: 900 }}>1</div>
            <h3>Phase 1: Eligibility</h3>
            <p style={{ color: 'var(--text-muted)' }}>AI-driven assessment of your qualifications, profession mapping, and labour market demand correlation.</p>
          </div>

          <div className="card">
            <div style={{ width: '40px', height: '40px', background: '#E3F2FD', color: '#1991DF', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', fontWeight: 900 }}>2</div>
            <h3>Phase 2: Validation</h3>
            <p style={{ color: 'var(--text-muted)' }}>Direct validation by employers. Real interviews, real hiring intent, pre-paid and verified.</p>
          </div>

          <div className="card">
            <div style={{ width: '40px', height: '40px', background: '#E3F2FD', color: '#1991DF', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', fontWeight: 900 }}>3</div>
            <h3>Phase 3: Execution</h3>
            <p style={{ color: 'var(--text-muted)' }}>Escrow-protected fund release based on verifiable milestones. You only pay when you succeed.</p>
          </div>
        </div>
      </section>

      {/* Whitepaper Quote */}
      <section style={{ background: '#001E3C', color: '#fff', padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h2 style={{ fontSize: '28px', fontStyle: 'italic', fontWeight: 400, opacity: 0.9 }}>
            "Migration is an economic coordination problem. MIGRION™ is the infrastructure that solves it."
          </h2>
          <div style={{ marginTop: '20px', opacity: 0.7, fontSize: '14px', letterSpacing: '2px', textTransform: 'uppercase' }}>
            Whitepaper - Part I
          </div>
        </div>
      </section>

      <footer style={{ padding: '40px 24px', textAlign: 'center', borderTop: '1px solid var(--border)', marginTop: 'auto' }}>
        <p style={{ opacity: 0.5, fontSize: '14px' }}>© 2026 MIGRION™ Infrastructure. All rights reserved.</p>
      </footer>
    </div>
  );
}
