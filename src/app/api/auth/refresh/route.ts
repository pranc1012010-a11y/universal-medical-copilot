// ============================================================
// POST /api/auth/refresh — Token Refresh Endpoint
// Implements JWT rotation: validates refresh token, issues new pair
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyRefreshToken, generateTokenPair, checkRateLimit } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimit = checkRateLimit(`refresh:${clientIp}`);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token is required' },
        { status: 400 }
      );
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid or expired refresh token' },
        { status: 401 }
      );
    }

    // Find user and verify stored refresh token
    const user = await db.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || user.refreshToken !== refreshToken) {
      return NextResponse.json(
        { error: 'Token mismatch — possible security breach. Please login again.' },
        { status: 401 }
      );
    }

    // Generate new token pair (rotation)
    const newTokens = generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role as 'admin' | 'doctor' | 'patient',
    });

    // Rotate refresh token in database
    await db.user.update({
      where: { id: user.id },
      data: { refreshToken: newTokens.refreshToken },
    });

    return NextResponse.json({
      accessToken: newTokens.accessToken,
      refreshToken: newTokens.refreshToken,
    });

  } catch (error) {
    console.error('[Auth] Token refresh error:', error);
    return NextResponse.json(
      { error: 'Internal server error during token refresh' },
      { status: 500 }
    );
  }
}
