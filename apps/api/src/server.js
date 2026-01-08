import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const app = express();
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));

const JWT_SECRET = process.env.JWT_SECRET || 'change_me';
function signToken(user) { return jwt.sign({ sub: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '7d' }); }
function requireAuth(req, res, next) {
  const h = req.headers.authorization || '';
  const t = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!t) return res.status(401).json({ error: 'UNAUTHORIZED' });
  try { req.auth = jwt.verify(t, JWT_SECRET); next(); } catch (e) { return res.status(401).json({ error: 'UNAUTHORIZED' }); }
}
async function audit(actorId, event, payload) {
  await prisma.auditLog.create({ data: { actorId, event, payload: JSON.stringify(payload) } });
}

app.get('/health', (req, res) => res.json({ ok: true, service: 'migrion-api-v13' }));

// AUTH
const Login = z.object({ email: z.string().email(), password: z.string().min(6) });
app.post('/v1/auth/login', async (req, res) => {
  const p = Login.safeParse(req.body); if (!p.success) return res.status(400).json({ error: 'INVALID' });
  const u = await prisma.user.findUnique({ where: { email: p.data.email } });
  if (!u) return res.status(401).json({ error: 'INVALID_CREDENTIALS' });
  const ok = await bcrypt.compare(p.data.password, u.password);
  if (!ok) return res.status(401).json({ error: 'INVALID_CREDENTIALS' });
  const token = signToken(u);
  await audit(u.id, 'auth_login', { email: u.email, role: u.role });
  res.json({ ok: true, token, role: u.role });
});
// Public Endpoints
app.get('/v1/public/destinations', async (req, res) => {
  const dest = await prisma.destination.findMany({ where: { enabled: true }, orderBy: { name: 'asc' } });
  res.json({ ok: true, dest });
});
app.get('/v1/public/page', async (req, res) => {
  const schema = z.object({ slug: z.string().min(1), locale: z.string().min(2) });
  const p = schema.safeParse(req.query); if (!p.success) return res.status(400).json({ error: 'INVALID' });
  const page = await prisma.contentPage.findFirst({ where: { slug: p.data.slug, locale: p.data.locale } });
  if (page) return res.json({ ok: true, page });
  const fallback = await prisma.contentPage.findFirst({ where: { slug: p.data.slug, locale: 'en' } });
  res.json({ ok: true, page: fallback });
});

// attach user/candidate/employer
app.use('/v1', requireAuth, async (req, res, next) => {
  const u = await prisma.user.findUnique({ where: { id: req.auth.sub }, include: { candidate: true, employer: true } });
  req.user = u; req.candidate = u?.candidate || null; req.employer = u?.employer || null;
  next();
});

app.get('/v1/me', async (req, res) => {
  res.json({ ok: true, user: req.user, candidate: req.candidate, employer: req.employer });
});

// Helpers for phase enforcement
function phasePaid(c, phase) { return phase === 1 ? c.phase1Paid : phase === 2 ? c.phase2Paid : phase === 3 ? c.phase3Paid : false; }
function requirePhasePaid(phase) {
  return (req, res, next) => {
    if (req.user.role !== 'candidate') return res.status(403).json({ error: 'FORBIDDEN' });
    if (!phasePaid(req.candidate, phase)) return res.status(403).json({ error: 'PHASE_NOT_PAID', phase });
    next();
  };
}
function requirePhaseSequence(phase) {
  return (req, res, next) => {
    if (req.user.role !== 'candidate') return res.status(403).json({ error: 'FORBIDDEN' });
    if (phase > 1 && !req.candidate.phase1Done) return res.status(403).json({ error: 'PREVIOUS_PHASE_NOT_DONE', phase: 1 });
    if (phase > 2 && !req.candidate.phase2Done) return res.status(403).json({ error: 'PREVIOUS_PHASE_NOT_DONE', phase: 2 });
    next();
  };
}
function requirePhaseDone(phase) {
  return (req, res, next) => {
    const done = phase === 1 ? req.candidate.phase1Done : phase === 2 ? req.candidate.phase2Done : false;
    if (!done) return res.status(403).json({ error: 'PHASE_NOT_COMPLETED', phase });
    next();
  };
}
function requireEscrowFunded(req, res, next) {
  if (!req.candidate.escrowFunded) return res.status(403).json({ error: 'ESCROW_NOT_FUNDED' });
  next();
}

// Candidate chooses destination (Phase 1 paid required)
app.post('/v1/candidate/set-destination', requirePhasePaid(1), async (req, res) => {
  const schema = z.object({ slug: z.string().min(2) });
  const p = schema.safeParse(req.body); if (!p.success) return res.status(400).json({ error: 'INVALID' });
  await prisma.candidate.update({ where: { id: req.candidate.id }, data: { destination: p.data.slug } });
  await audit(req.user.id, 'candidate_destination_set', { slug: p.data.slug });
  res.json({ ok: true });
});

// Phase payments (mock provider)
app.post('/v1/candidate/pay-phase', async (req, res) => {
  if (req.user.role !== 'candidate') return res.status(403).json({ error: 'FORBIDDEN' });
  const schema = z.object({ phase: z.number().int().min(1).max(3), amountCents: z.number().int().min(1), currency: z.string().default('USD'), provider: z.string().default('stripe_mock') });
  const p = schema.safeParse(req.body); if (!p.success) return res.status(400).json({ error: 'INVALID' });
  const pay = await prisma.payment.create({ data: { candidateId: req.candidate.id, phase: p.data.phase, amountCents: p.data.amountCents, currency: p.data.currency, status: 'paid', provider: p.data.provider } });
  const data = {};
  if (p.data.phase === 1) data.phase1Paid = true;
  if (p.data.phase === 2) data.phase2Paid = true;
  if (p.data.phase === 3) data.phase3Paid = true;
  await prisma.candidate.update({ where: { id: req.candidate.id }, data });
  await audit(req.user.id, 'candidate_phase_paid', { phase: p.data.phase, paymentId: pay.id });
  res.json({ ok: true, paymentId: pay.id });
});

// Phase 1 Specialized Services (Payment Required)
app.get('/v1/phase1/assessment', requirePhasePaid(1), async (req, res) => {
  res.json({ ok: true, score: 88, details: 'Profession mapped to NOC 2173. Eligibility high for Canada/UK.' });
});

app.get('/v1/phase1/roadmap', requirePhasePaid(1), async (req, res) => {
  res.json({ ok: true, roadmap: ['Document Verification', 'Employer Matchmaking', 'Escrow Setup'] });
});

// Phase services (blocked unless paid + sequential)
app.post('/v1/phase1/complete', requirePhasePaid(1), async (req, res) => {
  await prisma.candidate.update({ where: { id: req.candidate.id }, data: { phase1Done: true, currentPhase: 2 } });
  await audit(req.user.id, 'phase1_completed', {});
  res.json({ ok: true });
});
app.post('/v1/phase2/complete', requirePhasePaid(2), requirePhaseSequence(2), async (req, res) => {
  // Check if at least one interview was validated
  const validated = await prisma.interview.findFirst({ where: { candidateId: req.candidate.id, outcome: 'validated' } });
  if (!validated) return res.status(403).json({ error: 'EMPLOYER_VALIDATION_REQUIRED' });

  await prisma.candidate.update({ where: { id: req.candidate.id }, data: { phase2Done: true, currentPhase: 3 } });

  // Initialize Phase 3 Milestones
  const milestones = [
    { name: 'File Submission', requiredProof: 'Receipt', releaseCents: 250000 },
    { name: 'Sponsorship Grant', requiredProof: 'Certificate', releaseCents: 350000 },
    { name: 'Visa Approved', requiredProof: 'Copy of Visa', releaseCents: 400000 }
  ];
  for (const m of milestones) {
    await prisma.escrowMilestone.upsert({
      where: { id: req.candidate.id + '_' + m.name.replace(/\s/g, '_') }, // simplistic pseudo-unique id for demo
      update: {},
      create: { ...m, candidateId: req.candidate.id, id: req.candidate.id + '_' + m.name.replace(/\s/g, '_') }
    });
  }

  await audit(req.user.id, 'phase2_completed', { validationId: validated.id });
  res.json({ ok: true });
});

// Employer interview products + purchase
app.get('/v1/employer/interview-products', async (req, res) => {
  res.json({
    currency: 'USD', items: [
      { sku: 'INT_30', minutes: 30, priceCents: 25000 },
      { sku: 'INT_45', minutes: 45, priceCents: 35000 },
      { sku: 'INT_60', minutes: 60, priceCents: 45000 },
      { sku: 'PACK_5', label: '5 interviews', priceCents: 150000 },
      { sku: 'PACK_10', label: '10 interviews', priceCents: 270000 },
      { sku: 'MEMBER_1000', label: 'Employer membership (monthly)', priceCents: 100000 }
    ]
  });
});

app.post('/v1/employer/buy', async (req, res) => {
  if (req.user.role !== 'employer') return res.status(403).json({ error: 'FORBIDDEN' });
  const schema = z.object({ sku: z.string().min(3) });
  const p = schema.safeParse(req.body); if (!p.success) return res.status(400).json({ error: 'INVALID' });
  const priceMap = { INT_30: 25000, INT_45: 35000, INT_60: 45000, PACK_5: 150000, PACK_10: 270000, MEMBER_1000: 100000 };
  const amt = priceMap[p.data.sku]; if (!amt) return res.status(400).json({ error: 'UNKNOWN_SKU' });
  const pur = await prisma.employerPurchase.create({ data: { employerId: req.employer.id, sku: p.data.sku, amountCents: amt, currency: 'USD', status: 'paid' } });
  await audit(req.user.id, 'employer_purchase_paid', { purchaseId: pur.id, sku: p.data.sku });
  res.json({ ok: true, purchaseId: pur.id });
});

// Schedule interview requires employer paid purchase + candidate eligible (phase1 done + phase2 paid)
app.post('/v1/employer/schedule-interview', async (req, res) => {
  if (req.user.role !== 'employer') return res.status(403).json({ error: 'FORBIDDEN' });
  const schema = z.object({ candidateId: z.string().uuid(), scheduledAt: z.string().datetime(), durationMin: z.number().int().min(15).max(120), purchaseId: z.string().uuid() });
  const p = schema.safeParse(req.body); if (!p.success) return res.status(400).json({ error: 'INVALID' });
  const purchase = await prisma.employerPurchase.findFirst({ where: { id: p.data.purchaseId, employerId: req.employer.id, status: 'paid' } });
  if (!purchase) return res.status(403).json({ error: 'INTERVIEW_NOT_PAID' });
  const cand = await prisma.candidate.findUnique({ where: { id: p.data.candidateId } });
  if (!cand) return res.status(404).json({ error: 'CANDIDATE_NOT_FOUND' });
  if (!cand.phase1Done || !cand.phase2Paid) return res.status(403).json({ error: 'CANDIDATE_NOT_ELIGIBLE_FOR_INTERVIEW' });
  const i = await prisma.interview.create({ data: { employerId: req.employer.id, candidateId: cand.id, scheduledAt: new Date(p.data.scheduledAt), durationMin: p.data.durationMin, paid: true } });
  await audit(req.user.id, 'interview_scheduled', { interviewId: i.id });
  res.json({ ok: true, interviewId: i.id });
});

app.post('/v1/employer/interview-outcome', async (req, res) => {
  if (req.user.role !== 'employer') return res.status(403).json({ error: 'FORBIDDEN' });
  const schema = z.object({ interviewId: z.string().uuid(), outcome: z.enum(['validated', 'rejected']), notes: z.string().optional() });
  const p = schema.safeParse(req.body); if (!p.success) return res.status(400).json({ error: 'INVALID' });
  const i = await prisma.interview.findFirst({ where: { id: p.data.interviewId, employerId: req.employer.id } });
  if (!i) return res.status(404).json({ error: 'INTERVIEW_NOT_FOUND' });
  await prisma.interview.update({ where: { id: i.id }, data: { outcome: p.data.outcome, notes: p.data.notes || null } });
  if (p.data.outcome === 'validated') {
    await prisma.candidate.update({ where: { id: i.candidateId }, data: { phase2Done: true, currentPhase: 3 } });
  }
  await audit(req.user.id, 'interview_outcome', { interviewId: i.id, outcome: p.data.outcome });
  res.json({ ok: true });
});

// Escrow funding and milestone webhook
app.post('/v1/escrow/fund', requirePhasePaid(3), requirePhaseDone(2), async (req, res) => {
  await prisma.candidate.update({ where: { id: req.candidate.id }, data: { escrowFunded: true } });
  await audit(req.user.id, 'escrow_funded', {});
  res.json({ ok: true });
});

app.post('/v1/escrow/webhook', async (req, res) => {
  const secret = process.env.ESCROW_WEBHOOK_SECRET || '';
  if (secret && req.headers['x-escrow-secret'] !== secret) return res.status(401).json({ error: 'UNAUTHORIZED' });
  const schema = z.object({ candidateId: z.string().uuid(), milestoneName: z.string().min(2), status: z.enum(['approved', 'rejected']), reference: z.string().optional() });
  const p = schema.safeParse(req.body); if (!p.success) return res.status(400).json({ error: 'INVALID' });
  const ms = await prisma.escrowMilestone.findFirst({ where: { candidateId: p.data.candidateId, name: p.data.milestoneName } });
  if (!ms) return res.status(404).json({ error: 'MILESTONE_NOT_FOUND' });
  await prisma.escrowMilestone.update({ where: { id: ms.id }, data: { status: p.data.status, reference: p.data.reference || null } });
  await audit(null, 'escrow_milestone_updated', { candidateId: p.data.candidateId, milestone: p.data.milestoneName, status: p.data.status });
  res.json({ ok: true });
});

app.post('/v1/phase3/execute', requirePhasePaid(3), requirePhaseDone(2), requireEscrowFunded, async (req, res) => {
  await audit(req.user.id, 'phase3_execution_allowed', {});
  res.json({ ok: true, status: 'EXECUTION_ALLOWED' });
});

// Referrals + commissions (release requires admin + paid phase)
app.post('/v1/candidate/link-referral', async (req, res) => {
  if (req.user.role !== 'candidate') return res.status(403).json({ error: 'FORBIDDEN' });
  const schema = z.object({ referralCode: z.string().min(3), phase: z.number().int().min(1).max(3) });
  const p = schema.safeParse(req.body); if (!p.success) return res.status(400).json({ error: 'INVALID' });
  const ref = await prisma.referral.findUnique({ where: { code: p.data.referralCode } });
  if (!ref) return res.status(404).json({ error: 'REFERRAL_NOT_FOUND' });
  const amountMap = { 1: 5000, 2: 10000, 3: 15000 };
  const com = await prisma.commission.create({ data: { referralCode: ref.code, candidateId: req.candidate.id, phase: p.data.phase, amountCents: amountMap[p.data.phase], status: 'pending' } });
  await audit(req.user.id, 'candidate_linked_referral', { referralCode: ref.code, phase: p.data.phase });
  res.json({ ok: true, commissionId: com.id });
});

app.post('/v1/admin/release-commission', async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'FORBIDDEN' });
  const schema = z.object({ commissionId: z.string().uuid() });
  const p = schema.safeParse(req.body); if (!p.success) return res.status(400).json({ error: 'INVALID' });
  const com = await prisma.commission.findUnique({ where: { id: p.data.commissionId } });
  if (!com) return res.status(404).json({ error: 'NOT_FOUND' });
  const payment = await prisma.payment.findFirst({ where: { candidateId: com.candidateId, phase: com.phase, status: 'paid' } });
  if (!payment) return res.status(403).json({ error: 'PHASE_NOT_PAID' });
  await prisma.commission.update({ where: { id: com.id }, data: { status: 'released' } });
  await audit(req.user.id, 'commission_released', { commissionId: com.id });
  res.json({ ok: true });
});

app.get('/v1/admin/audit/export', async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'FORBIDDEN' });
  const logs = await prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 1000 });
  res.json({ ok: true, logs });
});

const port = Number(process.env.PORT || 4000);
app.listen(port, () => console.log('migrion-api-v13 on', port));
