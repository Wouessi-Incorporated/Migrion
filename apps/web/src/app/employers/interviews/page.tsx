'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Product {
    sku: string;
    price: number;
    name?: string; // API might not send name initially, we can infer or handle it
}

export default function EmployerInterviewsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch('/v1/employer/interview-products');
                if (!res.ok) throw new Error('Failed to fetch products');
                const data = await res.json();
                setProducts(data.items);
            } catch (err) {
                console.error(err);
                setError('Unable to load interview packages at this time.');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // Helper to format names since the API just returns SKU/Price in the raw response
    const getDisplayName = (sku: string) => {
        const names: Record<string, string> = {
            'INT_30': '30-Minute Screening Interview',
            'INT_60': '60-Minute Technical Interview',
            'MEMBER_1000': 'Premium Employer Membership'
        };
        return names[sku] || sku;
    };

    const handlePurchase = async (sku: string) => {
        alert(`Initiating secure payment for ${sku}...`);
        try {
            const res = await fetch('/v1/employer/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sku, employerId: 'DEMO-EMP-1' })
            });
            const data = await res.json();
            if (data.success) {
                alert(`Success! Booking ID: ${data.booking.id}\nProceeding to Escrow Initialization.`);
                // In a real app, router.push('/escrow');
            }
        } catch (e) {
            alert('Booking failed');
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 p-8">
            <div className="container mx-auto">
                <header className="mb-12 flex justify-between items-center">
                    <div>
                        <Link href="/" className="text-blue-400 hover:text-blue-300 font-semibold mb-2 block">← Back to Home</Link>
                        <h1 className="text-3xl font-bold text-white">Employer Interview Packages</h1>
                        <p className="text-slate-400 mt-2">Select a package to start screening candidates efficiently.</p>
                    </div>
                </header>

                {loading && <div className="text-center py-20 text-blue-400">Loading available packages...</div>}

                {error && (
                    <div className="bg-red-900/20 border border-red-500/50 text-red-200 p-4 rounded-lg text-center">
                        {error}
                    </div>
                )}

                {!loading && !error && (
                    <div className="products-grid">
                        {products.map((product) => (
                            <div key={product.sku} className="product-card">
                                <div className="text-sm text-blue-400 font-mono mb-2">{product.sku}</div>
                                <h3>{getDisplayName(product.sku)}</h3>
                                <div className="price">${product.price}</div>
                                <button
                                    onClick={() => handlePurchase(product.sku)}
                                    className="select-button"
                                >
                                    Purchase Package
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
