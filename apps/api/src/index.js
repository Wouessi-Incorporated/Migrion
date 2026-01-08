import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

const app = express();
const PORT = process.env.API_PORT || 4000;

// Mock Database (In-Memory for Demo)
const bookings = [];
const escrowContracts = [];

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- PHASE 1: INTELLIGENCE ---
app.post('/v1/candidates/eligibility', (req, res) => {
  const { role, experience, country } = req.body;
  const score = Math.floor(Math.random() * 30) + 70; // Mock score 70-100

  res.json({
    eligible: score > 75,
    score: score,
    phase: 'PHASE_1_PREPARATION',
    message: score > 75
      ? 'High probability. Proceed to Phase 2 (Employer Validation).'
      : 'Score below threshold.'
  });
});

app.get('/v1/countries', (req, res) => {
  res.json({
    items: [
      { id: 'ca', name: 'Canada', type: 'Points-based (Express Entry)', focus: 'Structured Demand' },
      { id: 'uk', name: 'United Kingdom', type: 'Employer-led Sponsorship', focus: 'Skilled Worker Visa' },
      { id: 'au', name: 'Australia', type: 'Points + Regional', focus: 'Skills Prioritization' },
      { id: 'ch', name: 'Switzerland', type: 'Quota-based', focus: 'High-Skill Precision' },
      { id: 'lu', name: 'Luxembourg', type: 'Institutional', focus: 'Finance & Tech' }
    ]
  });
});

// --- PHASE 2: EMPLOYER VALIDATION ---
app.get('/v1/employer/interview-products', (req, res) => {
  res.json({
    currency: 'USD',
    items: [
      { sku: 'INT_30', price: 250, name: '30 Minute Screening Interview' },
      { sku: 'INT_60', price: 450, name: '60 Minute Technical Interview' },
      { sku: 'MEMBER_1000', price: 1000, name: 'Premium Employer Membership' }
    ]
  });
});

app.post('/v1/employer/bookings', (req, res) => {
  const { sku, employerId } = req.body;
  const bookingId = 'BK-' + Math.random().toString(36).substr(2, 9).toUpperCase();

  const booking = {
    id: bookingId,
    sku,
    employerId: employerId || 'EMP-DEMO',
    status: 'CONFIRMED',
    timestamp: new Date()
  };

  bookings.push(booking);

  res.json({
    success: true,
    booking,
    message: 'Interview secured. Validation Phase initiated.',
    nextStep: '/escrow/initiate'
  });
});

// --- PHASE 3: EXECUTION & ESCROW ---
app.post('/v1/escrow/initiate', (req, res) => {
  const { bookingId, candidateName, amount } = req.body;
  const contractId = 'ESC-' + Math.random().toString(36).substr(2, 9).toUpperCase();

  const contract = {
    id: contractId,
    bookingId,
    candidateName,
    amount: amount || 10000,
    status: 'LOCKED', // Funds held
    conditions: ['Visa Grant', 'Work Permit Issuance'],
    releaseDate: 'TBD'
  };

  escrowContracts.push(contract);

  res.json({
    success: true,
    contract,
    message: 'Funds secured in Escrow. Execution Phase active.'
  });
});

app.get('/v1/escrow/contracts', (req, res) => {
  res.json({ items: escrowContracts });
});

app.post('/v1/escrow/webhook', (req, res) => {
  console.log('Webhook event received:', req.body);
  res.json({ received: true });
});

// Start Server
app.listen(PORT, () => {
  console.log(`API Service running on port ${PORT}`);
});
