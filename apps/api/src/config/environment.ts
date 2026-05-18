import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

// Environment variable validation schema
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3001'),
  
  // JWT Configuration
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  
  // Database Configuration — required, but accept both postgres:// and postgresql://
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  
  // Admin Credentials
  ADMIN_EMAIL: z.string().email('Invalid ADMIN_EMAIL format').optional(),
  ADMIN_PASSWORD: z.string().min(8).optional(),
  
  // Email Configuration — optional, features gracefully degrade without it
  SENDGRID_API_KEY: z.string().optional(),
  FROM_EMAIL: z.string().optional(),
  
  // Redis Configuration — optional, sessions fall back to in-memory
  REDIS_URL: z.string().optional(),
  
  // AWS Configuration — optional, file uploads gracefully degrade
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().optional(),
  AWS_S3_BUCKET: z.string().optional(),
  
  // Security Configuration
  BCRYPT_ROUNDS: z.string().transform(Number).default('12'),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('200'),
  
  // CORS Configuration
  CORS_ORIGIN: z.string().default('https://nextgenoutreach.co.za'),
  
  // Firebase Configuration — optional for local dev, required in production
  FIREBASE_SERVICE_ACCOUNT: z.string().optional(),

  // Session Configuration
  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET must be at least 32 characters').optional(),
  SESSION_MAX_AGE: z.string().transform(Number).default('86400000'),
});

// Validate environment variables
const envValidation = envSchema.safeParse(process.env);

if (!envValidation.success) {
  console.error('❌ Invalid environment variables:');
  envValidation.error.issues.forEach(issue => {
    console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
  });
  process.exit(1);
}

// Type-safe environment variables
const env = envValidation.data;

// JWT Configuration (from validated environment)
export const JWT_SECRET = env.JWT_SECRET;
export const JWT_EXPIRES_IN = env.JWT_EXPIRES_IN;
export const JWT_REFRESH_SECRET = env.JWT_REFRESH_SECRET;
export const JWT_REFRESH_EXPIRES_IN = env.JWT_REFRESH_EXPIRES_IN;

// Database Configuration
export const DATABASE_URL = env.DATABASE_URL;

// Server Configuration
export const PORT = env.PORT;
export const NODE_ENV = env.NODE_ENV;

// Admin Credentials (from validated environment)
export const ADMIN_EMAIL = env.ADMIN_EMAIL ?? '';
export const ADMIN_PASSWORD = env.ADMIN_PASSWORD ?? '';

// Email Configuration (from validated environment)
export const SENDGRID_API_KEY = env.SENDGRID_API_KEY ?? '';
export const FROM_EMAIL = env.FROM_EMAIL ?? '';

// Redis Configuration (from validated environment)
export const REDIS_URL = env.REDIS_URL ?? '';

// AWS Configuration (from validated environment)
export const AWS_ACCESS_KEY_ID = env.AWS_ACCESS_KEY_ID ?? '';
export const AWS_SECRET_ACCESS_KEY = env.AWS_SECRET_ACCESS_KEY ?? '';
export const AWS_REGION = env.AWS_REGION ?? 'us-east-1';
export const AWS_S3_BUCKET = env.AWS_S3_BUCKET ?? '';

// PayFast Configuration
export const PAYFAST_MERCHANT_ID = process.env.PAYFAST_MERCHANT_ID || '';
export const PAYFAST_MERCHANT_KEY = process.env.PAYFAST_MERCHANT_KEY || '';
export const PAYFAST_PASSPHRASE = process.env.PAYFAST_PASSPHRASE || '';
export const PAYFAST_MODE = process.env.PAYFAST_MODE || 'test'; // 'test' or 'live'

// GoLogin Configuration
export const GOLOGIN_API_TOKEN = process.env.GOLOGIN_API_TOKEN || '';
export const GOLOGIN_PROFILE_ID = process.env.GOLOGIN_PROFILE_ID || '';

// BitBrowser Configuration
export const BIT_BROWSER_API_URL = process.env.BIT_BROWSER_API_URL || '';
export const BIT_BROWSER_API_KEY = process.env.BIT_BROWSER_API_KEY || '';

// Security Configuration (from validated environment)
export const BCRYPT_ROUNDS = env.BCRYPT_ROUNDS;
export const RATE_LIMIT_WINDOW_MS = env.RATE_LIMIT_WINDOW_MS;
export const RATE_LIMIT_MAX_REQUESTS = env.RATE_LIMIT_MAX_REQUESTS;

// CORS Configuration (from validated environment)
export const CORS_ORIGIN = env.CORS_ORIGIN;

// Logging Configuration
export const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
export const LOG_FILE = process.env.LOG_FILE || 'logs/app.log';

// 2FA Configuration
export const TOTP_ISSUER = process.env.TOTP_ISSUER || 'NextGenOutreach';

// File Upload Configuration (optimized for 100+ active users)
export const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '5242880'); // 5MB
export const ALLOWED_FILE_TYPES = process.env.ALLOWED_FILE_TYPES?.split(',') || ['image/jpeg', 'image/png', 'application/pdf'];

// Session Configuration (from validated environment)
if (!env.SESSION_SECRET && env.NODE_ENV === 'production') {
  console.error('❌ SESSION_SECRET is required in production');
  process.exit(1);
}
export const SESSION_SECRET = env.SESSION_SECRET ?? 'dev-session-secret-not-for-production-use-only';
export const SESSION_MAX_AGE = env.SESSION_MAX_AGE;

// Development/Testing Flags
export const isDevelopment = NODE_ENV === 'development';
export const isProduction = NODE_ENV === 'production';
export const isTest = NODE_ENV === 'test';

export default {
  JWT_SECRET,
  JWT_EXPIRES_IN,
  JWT_REFRESH_SECRET,
  JWT_REFRESH_EXPIRES_IN,
  DATABASE_URL,
  PORT,
  NODE_ENV,
  SENDGRID_API_KEY,
  FROM_EMAIL,
  REDIS_URL,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_REGION,
  AWS_S3_BUCKET,
  PAYFAST_MERCHANT_ID,
  PAYFAST_MERCHANT_KEY,
  PAYFAST_PASSPHRASE,
  PAYFAST_MODE,
  GOLOGIN_API_TOKEN,
  GOLOGIN_PROFILE_ID,
  BIT_BROWSER_API_URL,
  BIT_BROWSER_API_KEY,
  BCRYPT_ROUNDS,
  RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX_REQUESTS,
  CORS_ORIGIN,
  LOG_LEVEL,
  LOG_FILE,
  TOTP_ISSUER,
  MAX_FILE_SIZE,
  ALLOWED_FILE_TYPES,
  SESSION_SECRET,
  SESSION_MAX_AGE,
  isDevelopment,
  isProduction,
  isTest
};
