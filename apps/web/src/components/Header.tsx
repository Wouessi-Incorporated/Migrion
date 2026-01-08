'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  const isDashboard = pathname.includes('dashboard') || pathname.includes('audit');

  return (
    <header style={{
      padding: '16px 24px',
      background: 'rgba(0, 30, 60, 0.95)',
      backdropFilter: 'blur(10px)',
      color: '#fff',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      borderBottom: '1px solid rgba(255,255,255,0.1)'
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Link href="/" style={{
          fontSize: '20px',
          fontWeight: 900,
          letterSpacing: '1px',
          color: '#fff',
          textDecoration: 'none'
        }}>
          MIGRION<span style={{ color: '#1991DF' }}>™</span>
        </Link>

        <nav style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          {!isDashboard && (
            <>
              <Link href="/" style={{ color: '#fff', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>Home</Link>
              <Link href="/countries" style={{ color: '#fff', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>Destinations</Link>
            </>
          )}
          <Link href="/login" style={{
            background: '#1991DF',
            color: '#001E3C',
            padding: '8px 20px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 800
          }}>
            {isDashboard ? 'Logout' : 'Login'}
          </Link>
        </nav>
      </div>
    </header>
  );
}
