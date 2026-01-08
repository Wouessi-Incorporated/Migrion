'use client';
import Header from '@/components/Header';
import { useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';

export default function Signup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'candidate' | 'employer'>('candidate');
    const [company, setCompany] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function submit() {
        if (!email || !password) return setError('Please fill in all fields.');
        if (role === 'employer' && !company) return setError('Please specify your company name.');

        setError('');
        setLoading(true);
        try {
            const r = await api('/v1/auth/signup', 'POST', {
                email,
                password,
                role,
                company: role === 'employer' ? company : undefined
            });
            localStorage.setItem('token', r.token);
            localStorage.setItem('role', r.role);

            const dashboard = r.role === 'employer' ? '/employer/dashboard' : '/candidate/dashboard';
            window.location.href = dashboard;
        } catch (e: any) {
            setError(e.data?.error || 'Registration failed. Try a different email.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
            <Header />

            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
                <div className="card" style={{ width: '100%', maxWidth: '480px', padding: '40px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <h1 style={{ fontSize: '28px', margin: '0 0 8px 0' }}>Join MIGRION™</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Start your outcome-based migration journey today.</p>
                    </div>

                    <div style={{ display: 'flex', background: '#F0F2F5', borderRadius: '12px', padding: '4px', marginBottom: '24px' }}>
                        <button
                            onClick={() => setRole('candidate')}
                            style={{
                                flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                                background: role === 'candidate' ? 'white' : 'transparent',
                                fontWeight: role === 'candidate' ? 700 : 500,
                                boxShadow: role === 'candidate' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                                transition: 'all 0.2s'
                            }}
                        >
                            Candidate
                        </button>
                        <button
                            onClick={() => setRole('employer')}
                            style={{
                                flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                                background: role === 'employer' ? 'white' : 'transparent',
                                fontWeight: role === 'employer' ? 700 : 500,
                                boxShadow: role === 'employer' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                                transition: 'all 0.2s'
                            }}
                        >
                            Employer
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {role === 'employer' && (
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px', color: 'var(--primary)' }}>Company Name</label>
                                <input
                                    className="input"
                                    value={company}
                                    onChange={e => setCompany(e.target.value)}
                                    placeholder="Acme Corp"
                                    type="text"
                                />
                            </div>
                        )}

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
                            {loading ? 'Creating Account...' : 'Get Started'}
                        </button>

                        <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px', color: 'var(--text-muted)' }}>
                            Already have an account? <Link href="/login" style={{ color: 'var(--secondary)', fontWeight: 600 }}>Sign In</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
