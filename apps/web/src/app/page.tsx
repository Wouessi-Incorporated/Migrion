'use client';

import { useState } from 'react';

export default function Page() {
    return (
        <div className="min-h-screen flex flex-col">
            <main className="hero">
                <div className="container">
                    <h1 className="title">MIGRION™</h1>
                    <p className="subtitle">Move with certainty. The next generation platform for seamless global mobility.</p>

                    <div className="flex gap-4 justify-center">
                        <a href="/employers/interviews" className="cta-button">
                            For Employers: Buy Interviews
                        </a>
                        <a href="/countries" className="secondary-button">
                            Explore Countries
                        </a>
                    </div>
                </div>
            </main>
            <footer>
                <p>&copy; {new Date().getFullYear()} Migrion. All rights reserved.</p>
            </footer>
        </div>
    );
}
