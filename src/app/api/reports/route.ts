// ============================================================
// GET /api/reports — Fetch Medical Reports for Authenticated User
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { extractBearerToken, verifyAccessToken, checkRateLimit } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimit = checkRateLimit(`reports:${clientIp}`);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const authHeader = request.headers.get('authorization');
    const token = extractBearerToken(authHeader);
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const reports = await db.medicalReport.findMany({
      where: { userId: decoded.userId },
      orderBy: { createdAt: 'desc' },
    });

    const parsedReports = reports.map(r => ({
      ...r,
      labMarkers: JSON.parse(r.labMarkers),
      radiologyFindings: JSON.parse(r.radiologyFindings),
      clinicalView: r.clinicalView ? JSON.parse(r.clinicalView) : null,
      patientView: r.patientView ? JSON.parse(r.patientView) : null,
      gradCamData: r.gradCamData ? JSON.parse(r.gradCamData) : null,
      glossaryTerms: JSON.parse(r.glossaryTerms),
    }));

    return NextResponse.json({ reports: parsedReports });

  } catch (error) {
    console.error('[Reports] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
}
