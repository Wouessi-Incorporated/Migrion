'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function EligibilityCheckPage() {
    const [formData, setFormData] = useState({
        role: '',
        experience: '',
        country: 'ca'
    });
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/v1/candidates/eligibility', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            setResult(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 p-8">
            <div className="container mx-auto max-w-2xl">
                <header className="mb-12">
                    <Link href="/" className="text-blue-400 hover:text-blue-300 font-semibold mb-2 block">← Back to Home</Link>
                    <h1 className="text-3xl font-bold text-white">Phase 1: Eligibility Check</h1>
                    <p className="text-slate-400 mt-2">AI-driven assessment for global migration probability.</p>
                </header>

                <div className="bg-slate-800 p-8 rounded-xl border border-slate-700">
                    {!result ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-slate-300 mb-2">Target Role</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white"
                                    placeholder="e.g. Software Engineer"
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-slate-300 mb-2">Years of Experience</label>
                                <input
                                    type="number"
                                    required
                                    className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white"
                                    value={formData.experience}
                                    onChange={e => setFormData({ ...formData, experience: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-slate-300 mb-2">Target Destination</label>
                                <select
                                    className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white"
                                    value={formData.country}
                                    onChange={e => setFormData({ ...formData, country: e.target.value })}
                                >
                                    <option value="ca">Canada</option>
                                    <option value="uk">United Kingdom</option>
                                    <option value="au">Australia</option>
                                    <option value="ch">Switzerland</option>
                                    <option value="lu">Luxembourg</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-colors"
                            >
                                {loading ? 'Analyzing Profile...' : 'Calculate Eligibility Score'}
                            </button>
                        </form>
                    ) : (
                        <div className="text-center animate-fade-in">
                            <div className={`text-5xl font-bold mb-4 ${result.eligible ? 'text-green-400' : 'text-yellow-400'}`}>
                                {result.score}/100
                            </div>
                            <h3 className="text-xl text-white font-semibold mb-2">
                                {result.eligible ? 'Probability: High' : 'Probability: Moderate'}
                            </h3>
                            <p className="text-slate-300 mb-6">{result.message}</p>

                            {result.eligible && (
                                <div className="p-4 bg-blue-900/30 border border-blue-500/30 rounded-lg">
                                    <p className="text-blue-200 text-sm mb-4">You are cleared for Phase 2.</p>
                                    <Link href="/employers/interviews" className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-full font-semibold">
                                        Proceed to Employer Validation
                                    </Link>
                                </div>
                            )}

                            <button
                                onClick={() => setResult(null)}
                                className="mt-6 text-slate-500 hover:text-slate-400 underline"
                            >
                                Check another profile
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
