'use client';
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
