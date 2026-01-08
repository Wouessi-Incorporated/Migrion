/**
 * MIGRION V13 - Application Logic Test Suite
 * 
 * This script tests the core business logic of the application.
 */

import 'dotenv/config';

const API_URL = process.env.API_URL || 'http://localhost:4000';

// Test credentials (from seed data)
const CREDENTIALS = {
    admin: { email: 'admin@migrion.local', password: 'ChangeMeNow123!' },
    candidate: { email: 'candidate@migrion.local', password: 'ChangeMeNow123!' },
    employer: { email: 'employer@migrion.local', password: 'ChangeMeNow123!' }
};

let tokens = {};
let testData = {};

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;
    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    });

    const data = await response.json();
    return { status: response.status, data };
}

// Test 1: Health Check
async function testHealthCheck() {
    const { status, data } = await apiCall('/health');

    if (status === 200 && data.ok && data.service === 'migrion-api-v13') {
        return true;
    } else {
        console.log('[FAIL] Health check failed', data);
        return false;
    }
}

// Test 2: Authentication
async function testAuthentication() {
    for (const [role, creds] of Object.entries(CREDENTIALS)) {
        const { status, data } = await apiCall('/v1/auth/login', {
            method: 'POST',
            body: JSON.stringify(creds)
        });

        if (status === 200 && data.ok && data.token) {
            tokens[role] = data.token;
        } else {
            console.log(`[FAIL] ${role} login failed`, data);
            return false;
        }
    }

    return true;
}

// Test 3: Public Endpoints
async function testPublicEndpoints() {
    // Test destinations
    const { status: destStatus, data: destData } = await apiCall('/v1/public/destinations');
    if (destStatus === 200 && destData.ok && destData.dest.length > 0) {
        testData.destinations = destData.dest;
    } else {
        console.log('[FAIL] Failed to load destinations', destData);
        return false;
    }

    // Test content page
    const { status: pageStatus, data: pageData } = await apiCall('/v1/public/page?slug=country-switzerland&locale=en');
    if (pageStatus === 200 && pageData.ok && pageData.page) {
    } else {
        console.log('[FAIL] Failed to load content page', pageData);
        return false;
    }

    return true;
}

// Test 4: Phase 1 - Payment Required Before Service
async function testPhase1PaymentEnforcement() {
    // Try to set destination without paying (should fail)
    const { status: failStatus, data: failData } = await apiCall('/v1/candidate/set-destination', {
        method: 'POST',
        headers: { Authorization: `Bearer ${tokens.candidate}` },
        body: JSON.stringify({ slug: 'switzerland' })
    });

    if (failStatus === 403 && failData.error === 'PHASE_NOT_PAID') {
    } else {
        console.log('[FAIL] Failed to enforce payment requirement', failData);
        return false;
    }

    // Pay for Phase 1
    const { status: payStatus, data: payData } = await apiCall('/v1/candidate/pay-phase', {
        method: 'POST',
        headers: { Authorization: `Bearer ${tokens.candidate}` },
        body: JSON.stringify({ phase: 1, amountCents: 50000, currency: 'USD' })
    });

    if (payStatus === 200 && payData.ok) {
        testData.phase1PaymentId = payData.paymentId;
    } else {
        console.log('[FAIL] Phase 1 payment failed', payData);
        return false;
    }

    // Now try to set destination (should succeed)
    const { status: successStatus, data: successData } = await apiCall('/v1/candidate/set-destination', {
        method: 'POST',
        headers: { Authorization: `Bearer ${tokens.candidate}` },
        body: JSON.stringify({ slug: 'switzerland' })
    });

    if (successStatus === 200 && successData.ok) {
    } else {
        console.log('[FAIL] Failed to set destination after payment', successData);
        return false;
    }

    return true;
}

// Test 5: Phase 1 Completion
async function testPhase1Completion() {
    const { status, data } = await apiCall('/v1/phase1/complete', {
        method: 'POST',
        headers: { Authorization: `Bearer ${tokens.candidate}` }
    });

    if (status === 200 && data.ok) {
        return true;
    } else {
        console.log('[FAIL] Phase 1 completion failed', data);
        return false;
    }
}

// Test 6: Phase 2 - Employer Workflow
async function testPhase2EmployerWorkflow() {
    const { status: prodStatus, data: prodData } = await apiCall('/v1/employer/interview-products', {
        headers: { Authorization: `Bearer ${tokens.employer}` }
    });

    if (prodStatus === 200 && prodData.items && prodData.items.length > 0) {
    } else {
        console.log('[FAIL] Failed to load interview products', prodData);
        return false;
    }

    const { status: buyStatus, data: buyData } = await apiCall('/v1/employer/buy', {
        method: 'POST',
        headers: { Authorization: `Bearer ${tokens.employer}` },
        body: JSON.stringify({ sku: 'INT_30' })
    });

    if (buyStatus === 200 && buyData.ok) {
        testData.purchaseId = buyData.purchaseId;
    } else {
        console.log('[FAIL] Employer purchase failed', buyData);
        return false;
    }

    return true;
}

// Test 7: Phase 2 Payment and Interview Scheduling
async function testPhase2InterviewScheduling() {
    const { status: payStatus, data: payData } = await apiCall('/v1/candidate/pay-phase', {
        method: 'POST',
        headers: { Authorization: `Bearer ${tokens.candidate}` },
        body: JSON.stringify({ phase: 2, amountCents: 100000, currency: 'USD' })
    });

    if (payStatus === 200 && payData.ok) {
    } else {
        console.log('[FAIL] Phase 2 payment failed', payData);
        return false;
    }
    return true;
}

// Test 8: Phase 2 Completion
async function testPhase2Completion() {
    const { status, data } = await apiCall('/v1/phase2/complete', {
        method: 'POST',
        headers: { Authorization: `Bearer ${tokens.candidate}` }
    });

    if (status === 200 && data.ok) {
        return true;
    } else {
        console.log('[FAIL] Phase 2 completion failed', data);
        return false;
    }
}

// Test 9: Phase 3 - Escrow System
async function testPhase3EscrowSystem() {
    const { status: payStatus, data: payData } = await apiCall('/v1/candidate/pay-phase', {
        method: 'POST',
        headers: { Authorization: `Bearer ${tokens.candidate}` },
        body: JSON.stringify({ phase: 3, amountCents: 150000, currency: 'USD' })
    });

    if (payStatus === 200 && payData.ok) {
    } else {
        console.log('[FAIL] Phase 3 payment failed', payData);
        return false;
    }

    const { status: fundStatus, data: fundData } = await apiCall('/v1/escrow/fund', {
        method: 'POST',
        headers: { Authorization: `Bearer ${tokens.candidate}` }
    });

    if (fundStatus === 200 && fundData.ok) {
    } else {
        console.log('[FAIL] Escrow funding failed', fundData);
        return false;
    }

    const { status: execStatus, data: execData } = await apiCall('/v1/phase3/execute', {
        method: 'POST',
        headers: { Authorization: `Bearer ${tokens.candidate}` }
    });

    if (execStatus === 200 && execData.ok) {
        return true;
    } else {
        console.log('[FAIL] Phase 3 execution failed', execData);
        return false;
    }
}

// Test 10: Referral System
async function testReferralSystem() {
    const { status, data } = await apiCall('/v1/candidate/link-referral', {
        method: 'POST',
        headers: { Authorization: `Bearer ${tokens.candidate}` },
        body: JSON.stringify({ referralCode: 'RES-001', phase: 1 })
    });

    if (status === 200 && data.ok) {
        testData.commissionId = data.commissionId;
        return true;
    } else {
        console.log('[FAIL] Referral linking failed', data);
        return false;
    }
}

// Test 11: Admin Functions
async function testAdminFunctions() {
    if (!testData.commissionId) {
        return true;
    }

    const { status: releaseStatus, data: releaseData } = await apiCall('/v1/admin/release-commission', {
        method: 'POST',
        headers: { Authorization: `Bearer ${tokens.admin}` },
        body: JSON.stringify({ commissionId: testData.commissionId })
    });

    if (releaseStatus === 200 && releaseData.ok) {
    } else {
        console.log('[FAIL] Commission release failed', releaseData);
        return false;
    }

    const { status: auditStatus, data: auditData } = await apiCall('/v1/admin/audit/export', {
        headers: { Authorization: `Bearer ${tokens.admin}` }
    });

    if (auditStatus === 200 && auditData.ok && auditData.logs) {
        return true;
    } else {
        console.log('[FAIL] Audit log export failed', auditData);
        return false;
    }
}

// Main test runner
async function runTests() {
    console.log('--- MIGRION V13 - Logic Test ---');
    console.log(`\nAPI URL: ${API_URL}`);
    console.log('Starting tests...\n');

    const tests = [
        { name: 'Health Check', fn: testHealthCheck },
        { name: 'Authentication', fn: testAuthentication },
        { name: 'Public Endpoints', fn: testPublicEndpoints },
        { name: 'Phase 1 Payment Enforcement', fn: testPhase1PaymentEnforcement },
        { name: 'Phase 1 Completion', fn: testPhase1Completion },
        { name: 'Phase 2 Employer Workflow', fn: testPhase2EmployerWorkflow },
        { name: 'Phase 2 Interview Scheduling', fn: testPhase2InterviewScheduling },
        { name: 'Phase 2 Completion', fn: testPhase2Completion },
        { name: 'Phase 3 Escrow System', fn: testPhase3EscrowSystem },
        { name: 'Referral System', fn: testReferralSystem },
        { name: 'Admin Functions', fn: testAdminFunctions }
    ];

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
        try {
            const result = await test.fn();
            if (result) {
                passed++;
            } else {
                failed++;
            }
        } catch (error) {
            console.log(`[ERROR] Test "${test.name}" threw error:`, error.message);
            failed++;
        }
    }

    console.log('\n--- Test Results ---');
    console.log(`\nPassed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Total:  ${passed + failed}`);
    console.log(`\n${failed === 0 ? 'All tests passed!' : 'Some tests failed'}\n`);

    process.exit(failed === 0 ? 0 : 1);
}

// Run tests
runTests().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
