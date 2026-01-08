'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import '../components.css';

interface Country {
    id: string;
    name: string;
    type: string;
    focus: string;
}

export default function CountriesPage() {
    const [countries, setCountries] = useState<Country[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:4000/v1/countries')
            .then(res => res.json())
            .then(data => setCountries(data.items))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="min-h-screen bg-slate-900 p-8">
            <div className="container mx-auto">
                <header className="mb-12">
                    <Link href="/" className="text-blue-400 hover:text-blue-300 font-semibold mb-2 block">← Back to Home</Link>
                    <h1 className="text-3xl font-bold text-white">Country Execution Layers</h1>
                    <p className="text-slate-400 mt-2">Jurisdiction-specific pathways optimized for local labor markets.</p>
                </header>

                {loading ? (
                    <div className="text-center text-slate-500">Loading destinations...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {countries.map(c => (
                            <div key={c.id} className="bg-slate-800 p-6 rounded-xl border border-slate-700 hover:border-blue-500/50 transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <h2 className="text-xl font-bold text-white">{c.name}</h2>
                                    <span className="text-2xl">{getFlag(c.id)}</span>
                                </div>
                                <div className="space-y-2 mb-6">
                                    <div className="text-sm">
                                        <span className="text-slate-500">Model:</span>
                                        <div className="text-blue-200 font-medium">{c.type}</div>
                                    </div>
                                    <div className="text-sm">
                                        <span className="text-slate-500">Focus:</span>
                                        <div className="text-slate-300">{c.focus}</div>
                                    </div>
                                </div>
                                <Link href="/candidates/eligibility" className="block w-full text-center bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg text-sm font-semibold transition-colors">
                                    Check Eligibility
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function getFlag(code: string) {
    const flags: Record<string, string> = {
        'ca': '🇨🇦',
        'uk': '🇬🇧',
        'au': '🇦🇺',
        'ch': '🇨🇭',
        'lu': '🇱🇺'
    };
    return flags[code] || '🌍';
}
