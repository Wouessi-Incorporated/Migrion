/**
 * MIGRION V13 - Application Logic Test Suite (Hardened)
 */

import 'dotenv/config';

const API_URL = process.env.API_URL || 'http://localhost:4000';

const CREDENTIALS = {
    admin: { email: 'admin@migrion.local', password: 'ChangeMeNow123!' },
    candidate: { email: 'candidate@migrion.local', password: 'ChangeMeNow123!' },
    employer: { email: 'employer@migrion.local', password: 'ChangeMeNow123!' }
};

let tokens = {};
let testData = {};

async function apiCall(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;
    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        }
    });

    const data = await response.json().catch(() => ({}));
    return { status: response.status, data };
}

async function testHealthCheck() {
    const { status, data } = await apiCall('/health');
    return status === 200 && data.ok;
}

async function testAuthentication() {
    for (const [role, creds] of Object.entries(CREDENTIALS)) {
        const { status, data } = await apiCall('/v1/auth/login', {
            method: 'POST',
            body: JSON.stringify(creds)
        });
        if (status === 200 && data.token) tokens[role] = data.token;
        else return false;
    }
    return true;
}

async function testPhase1Payment() {
    // 1. Check assessment is blocked
    const { status: s1, data: d1 } = await apiCall('/v1/phase1/assessment', { headers: { Authorization: `Bearer ${tokens.candidate}` } });
    if (s1 !== 403) return false;

    // 2. Pay Phase 1
    const { status: s2 } = await apiCall('/v1/candidate/pay-phase', {
        method: 'POST',
        headers: { Authorization: `Bearer ${tokens.candidate}` },
        body: JSON.stringify({ phase: 1, amountCents: 49900 })
    });
    if (s2 !== 200) return false;

    // 3. Check access
    const { status: s3 } = await apiCall('/v1/phase1/assessment', { headers: { Authorization: `Bearer ${tokens.candidate}` } });
    if (s3 !== 200) return false;

    // 4. Set destination
    const { status: s4 } = await apiCall('/v1/candidate/set-destination', {
        method: 'POST',
        headers: { Authorization: `Bearer ${tokens.candidate}` },
        body: JSON.stringify({ slug: 'switzerland' })
    });
    if (s4 !== 200) return false;
    return true;
}

async function testPhase1Complete() {
    const { status } = await apiCall('/v1/phase1/complete', {
        method: 'POST', headers: { Authorization: `Bearer ${tokens.candidate}` }
    });
    return status === 200;
}

async function testPhase2Workflow() {
    // 1. Employer buys product
    const { status: s1, data: d1 } = await apiCall('/v1/employer/buy', {
        method: 'POST', headers: { Authorization: `Bearer ${tokens.employer}` }, body: JSON.stringify({ sku: 'INT_30' })
    });
    if (s1 !== 200) return false;
    testData.purchaseId = d1.purchaseId;

    // 2. Candidate pays Phase 2
    const { status: s2 } = await apiCall('/v1/candidate/pay-phase', {
        method: 'POST', headers: { Authorization: `Bearer ${tokens.candidate}` }, body: JSON.stringify({ phase: 2, amountCents: 99900 })
    });
    if (s2 !== 200) return false;

    // 3. Get candidate Id
    const { data: me } = await apiCall('/v1/me', { headers: { Authorization: `Bearer ${tokens.candidate}` } });

    // 4. Schedule
    const { status: s4, data: d4 } = await apiCall('/v1/employer/schedule-interview', {
        method: 'POST', headers: { Authorization: `Bearer ${tokens.employer}` },
        body: JSON.stringify({ candidateId: me.candidate.id, scheduledAt: new Date().toISOString(), durationMin: 30, purchaseId: testData.purchaseId })
    });
    if (s4 !== 200) return false;

    // 5. Outcome
    const { status: s5 } = await apiCall('/v1/employer/interview-outcome', {
        method: 'POST', headers: { Authorization: `Bearer ${tokens.employer}` },
        body: JSON.stringify({ interviewId: d4.interviewId, outcome: 'validated' })
    });
    if (s5 !== 200) return false;

    // 6. Complete Phase 2
    const { status: s6 } = await apiCall('/v1/phase2/complete', {
        method: 'POST', headers: { Authorization: `Bearer ${tokens.candidate}` }
    });
    return s6 === 200;
}

async function testPhase3Escrow() {
    // 1. Pay Phase 3
    await apiCall('/v1/candidate/pay-phase', {
        method: 'POST', headers: { Authorization: `Bearer ${tokens.candidate}` }, body: JSON.stringify({ phase: 3, amountCents: 150000 })
    });
    // 2. Fund
    const { status: s2 } = await apiCall('/v1/escrow/fund', {
        method: 'POST', headers: { Authorization: `Bearer ${tokens.candidate}` }
    });
    if (s2 !== 200) return false;
    // 3. Exec
    const { status: s3 } = await apiCall('/v1/phase3/execute', {
        method: 'POST', headers: { Authorization: `Bearer ${tokens.candidate}` }
    });
    return s3 === 200;
}

async function testReferrals() {
    // Link referral for Phase 1 (already paid)
    const { status: s1, data: d1 } = await apiCall('/v1/candidate/link-referral', {
        method: 'POST', headers: { Authorization: `Bearer ${tokens.candidate}` }, body: JSON.stringify({ referralCode: 'RES-001', phase: 1 })
    });
    if (s1 !== 200) return false;

    // Admin release
    const { status: s2 } = await apiCall('/v1/admin/release-commission', {
        method: 'POST', headers: { Authorization: `Bearer ${tokens.admin}` }, body: JSON.stringify({ commissionId: d1.commissionId })
    });
    return s2 === 200;
}

async function run() {
    const tests = [
        { name: 'Health', fn: testHealthCheck },
        { name: 'Auth', fn: testAuthentication },
        { name: 'Phase 1 Payment & Assessment', fn: testPhase1Payment },
        { name: 'Phase 1 Completion', fn: testPhase1Complete },
        { name: 'Phase 2 & Employer Workflow', fn: testPhase2Workflow },
        { name: 'Phase 3 & Escrow', fn: testPhase3Escrow },
        { name: 'Referrals & Commission', fn: testReferrals }
    ];

    let ok = 0;
    for (const t of tests) {
        try {
            const result = await t.fn();
            if (result) { console.log(`[PASS] ${t.name}`); ok++; }
            else { console.log(`[FAIL] ${t.name}`); }
        } catch (e) { console.log(`[ERR] ${t.name}: ${e.message}`); }
    }
    console.log(`\nResult: ${ok}/${tests.length}`);
    process.exit(ok === tests.length ? 0 : 1);
}

run();
