import { z } from 'zod';
import 'dotenv/config';

const envSchema = z.object({
    PORT: z.coerce.number().default(4000),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
    JWT_SECRET: z.string().min(8, "JWT_SECRET must be at least 8 chars"),
    ESCROW_WEBHOOK_SECRET: z.string().optional(),
    ALLOWED_ORIGINS: z.string().default('http://localhost:3000'), // Comma separated for multiple
});

// Validate env vars
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error("❌ Invalid environment variables:", parsed.error.format());
    process.exit(1);
}

export const config = parsed.data;
