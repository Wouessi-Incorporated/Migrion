import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.get('/v1/employer/interview-products', (req, res) => {
  res.json({
    currency: 'USD',
    items: [
      { sku: 'INT_30', price: 250, name: '30 Minute Interview' },
      { sku: 'INT_60', price: 450, name: '60 Minute Interview' },
      { sku: 'MEMBER_1000', price: 1000, name: 'Membership Tier' }
    ]
  });
});

app.post('/v1/escrow/webhook', (req, res) => {
  console.log('Webhook event received:', req.body);
  res.json({ received: true });
});

// Start Server
app.listen(PORT, () => {
  console.log(`API Service running on port ${PORT}`);
});
