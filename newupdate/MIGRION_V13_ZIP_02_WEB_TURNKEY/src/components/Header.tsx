'use client';
import Link from 'next/link';
export default function Header(){
  return (
    <div style={{padding:'14px 24px',background:'#001E3C',color:'#fff'}}>
      <div style={{maxWidth:1100,margin:'0 auto',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{fontWeight:900}}>MIGRION™</div>
        <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
          <Link href="/" style={{color:'#fff',textDecoration:'none'}}>Home</Link>
          <Link href="/countries" style={{color:'#fff',textDecoration:'none'}}>Countries</Link>
          <Link href="/login" style={{color:'#fff',textDecoration:'none'}}>Login</Link>
        </div>
      </div>
    </div>
  );
}
