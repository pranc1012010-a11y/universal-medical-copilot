// ============================================================
// JWT Authentication & Authorization Utilities
// Bulletproof token management with rotation support
// ============================================================

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'med-copilot-ultra-secure-key-change-in-prod';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'med-copilot-refresh-key-change-in-prod';
const ACCESS_TOKEN_EXPIRY = '15m';   // Short-lived access token
const REFRESH_TOKEN_EXPIRY = '7d';   // Longer-lived refresh token

// ── Token Payload Types ──────────────────────────────────────
export interface TokenPayload {
  userId: string;
  email: string;
  role: 'admin' | 'doctor' | 'patient';
}

export interface DecodedToken extends TokenPayload {
  iat: number;
  exp: number;
  type: 'access' | 'refresh';
}

// ── Access Token Generation ──────────────────────────────────
export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(
    { ...payload, type: 'access' },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
}

// ── Refresh Token Generation ─────────────────────────────────
export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(
    { ...payload, type: 'refresh' },
    JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );
}

// ── Token Pair Generation (for login/register) ──────────────
export function generateTokenPair(payload: TokenPayload): {
  accessToken: string;
  refreshToken: string;
} {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
}

// ── Access Token Verification ────────────────────────────────
export function verifyAccessToken(token: string): DecodedToken | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    if (decoded.type !== 'access') return null;
    return decoded;
  } catch {
    return null;
  }
}

// ── Refresh Token Verification ───────────────────────────────
export function verifyRefreshToken(token: string): DecodedToken | null {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as DecodedToken;
    if (decoded.type !== 'refresh') return null;
    return decoded;
  } catch {
    return null;
  }
}

// ── RBAC Middleware Helper ───────────────────────────────────
export function hasRole(decoded: DecodedToken, requiredRoles: string[]): boolean {
  return requiredRoles.includes(decoded.role);
}

// ── Extract Bearer Token from Headers ───────────────────────
export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader) return null;
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
  return parts[1];
}

// ── Password Hashing (Web Crypto API) ───────────────────────
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ── Password Verification ───────────────────────────────────
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

// ── NoSQL Injection Sanitizer ────────────────────────────────
export function sanitizeInput(input: string): string {
  // Strip MongoDB operators and suspicious patterns
  return input
    .replace(/[${}]/g, '')          // No template literals or object notation
    .replace(/\$[a-zA-Z]/g, '')     // No MongoDB operators like $ne, $gt
    .replace(/\.\./g, '')           // No path traversal
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // No XSS scripts
    .trim();
}

// ── API Rate Limiter (In-Memory Token Bucket) ───────────────
interface RateLimitBucket {
  tokens: number;
  lastRefill: number;
}

const rateLimitStore = new Map<string, RateLimitBucket>();
const RATE_LIMIT_WINDOW = 60_000;     // 1 minute
const RATE_LIMIT_MAX_TOKENS = 30;      // 30 requests per minute
const RATE_LIMIT_REFILL_RATE = 0.5;    // 1 token per 2 seconds

export function checkRateLimit(identifier: string): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
} {
  const now = Date.now();
  let bucket = rateLimitStore.get(identifier);

  if (!bucket) {
    bucket = { tokens: RATE_LIMIT_MAX_TOKENS, lastRefill: now };
    rateLimitStore.set(identifier, bucket);
  }

  // Refill tokens based on elapsed time
  const elapsed = now - bucket.lastRefill;
  const tokensToAdd = elapsed * (RATE_LIMIT_REFILL_RATE / 1000);
  bucket.tokens = Math.min(RATE_LIMIT_MAX_TOKENS, bucket.tokens + tokensToAdd);
  bucket.lastRefill = now;

  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    return {
      allowed: true,
      remaining: Math.floor(bucket.tokens),
      resetAt: now + RATE_LIMIT_WINDOW,
    };
  }

  return {
    allowed: false,
    remaining: 0,
    resetAt: now + RATE_LIMIT_WINDOW,
  };
}
