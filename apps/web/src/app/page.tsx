'use client';
import Header from '@/components/Header';
import Link from 'next/link';
export default function Home(){
  return (
    <div>
      <Header/>
      <div style={{maxWidth:1100,margin:'0 auto',padding:24}}>
        <h1 style={{margin:'10px 0 6px',color:'#001E3C'}}>Move with certainty.</h1>
        <p style={{color:'#193044',lineHeight:1.7,maxWidth:780}}>
          MIGRION is a phase-locked immigration platform. Every service is blocked unless the phase is paid.
          Phase 2 is employer-paid live video interviews. Phase 3 uses independent escrow with milestones.
        </p>
        <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
          <Link href="/login" style={{padding:'10px 14px',background:'#1991DF',color:'#001E3C',borderRadius:12,textDecoration:'none',fontWeight:900}}>Login</Link>
          <Link href="/countries" style={{padding:'10px 14px',border:'1px solid #C3C6C9',borderRadius:12,textDecoration:'none',fontWeight:900,color:'#193044'}}>Explore destinations</Link>
        </div>
      </div>
    </div>
  );
}
