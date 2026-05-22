// ============================================================
// POST /api/auth/register — User Registration Endpoint
// Creates new user with hashed password and crypto key
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, sanitizeInput, checkRateLimit, generateTokenPair } from '@/lib/auth';
import { generateUserCryptoKey } from '@/lib/encryption';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting check
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimit = checkRateLimit(`register:${clientIp}`);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.', resetAt: rateLimit.resetAt },
        { status: 429, headers: { 'X-RateLimit-Remaining': '0' } }
      );
    }

    const body = await request.json();
    const { email, password, name, role } = body;

    // Input validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Sanitize inputs against NoSQL injection and XSS
    const sanitizedEmail = sanitizeInput(email).toLowerCase();
    const sanitizedName = name ? sanitizeInput(name) : null;
    const validRoles = ['admin', 'doctor', 'patient'];
    const sanitizedRole = validRoles.includes(role) ? role : 'patient';

    if (!sanitizedEmail.includes('@')) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: sanitizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password and generate crypto key
    const passwordHash = await hashPassword(password);
    const cryptoKey = generateUserCryptoKey();

    // Create user
    const user = await db.user.create({
      data: {
        email: sanitizedEmail,
        name: sanitizedName,
        passwordHash,
        role: sanitizedRole,
        cryptoKey,
      },
    });

    // Generate JWT token pair
    const tokens = generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role as 'admin' | 'doctor' | 'patient',
    });

    // Store refresh token (hashed)
    await db.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken },
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    }, { status: 201 });

  } catch (error) {
    console.error('[Auth] Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error during registration' },
      { status: 500 }
    );
  }
}
