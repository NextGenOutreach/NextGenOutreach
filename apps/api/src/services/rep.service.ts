import { RepProfile } from '@nextgenoutreach/types';
import prisma from '../lib/database';

export const ONBOARDING_STEPS = {
  1: 'basic_profile',
  2: 'linkedin_details',
  3: 'id_upload',
  4: 'awaiting_verification',
  5: 'twofa_setup',
  6: 'browser_setup',
  7: 'complete',
} as const;

export async function advanceOnboardingStep(repId: string, step: number) {
  await prisma.repProfile.update({
    where: { id: repId },
    data: { onboardingStep: step + 1 }
  });
}

export async function updateRepProfile(repId: string, data: Partial<RepProfile>) {
  return await prisma.repProfile.update({
    where: { id: repId },
    data
  });
}

export async function getRepProfile(userId: string) {
  return await prisma.repProfile.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          status: true
        }
      }
    }
  });
}

export async function getRepsForVerification() {
  return await prisma.repProfile.findMany({
    where: {
      idVerified: false,
      onboardingStep: 4, // awaiting_verification
      idDocumentUrl: {
        not: null
      }
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          createdAt: true
        }
      }
    },
    orderBy: {
      createdAt: 'asc'
    }
  });
}

export async function verifyRep(repId: string, approved: boolean, rejectionReason?: string) {
  const updateData: any = {
    idVerified: approved,
    idVerifiedAt: approved ? new Date() : null,
    onboardingStep: approved ? 5 : 3, // Move to 2FA or back to upload
  };

  if (!approved && rejectionReason) {
    updateData.rejectionReason = rejectionReason;
  }

  return await prisma.repProfile.update({
    where: { id: repId },
    data: updateData
  });
}

export async function getRepById(repId: string) {
  return await prisma.repProfile.findUnique({
    where: { id: repId },
    include: {
      user: true
    }
  });
}

// ─── Trust Score & Tiers ──────────────────────────────────────────────────────

/**
 * Recalculates the Trust Score (0-100) for a rep based on Section 5.4
 */
export async function calculateRepTrustScore(repId: string) {
  const rep = await prisma.repProfile.findUnique({
    where: { id: repId },
    include: {
      dailyReports: {
        where: {
          reportDate: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } // Last 90 days
        }
      },
      qaScores: {
        orderBy: { createdAt: 'desc' },
        take: 10
      }
    }
  });

  if (!rep) return 70;

  // 1. Compliance Score (35%)
  const incidents = await prisma.incident.count({
    where: { 
      relatedToId: repId, 
      relatedToType: 'rep',
      reportedAt: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
    }
  });
  const complianceScore = Math.max(0, 100 - (incidents * 15)) * 0.35;

  // 2. Performance Score (35%)
  const totalReplies = rep.dailyReports.reduce((sum, r) => sum + r.repliesReceived, 0);
  const totalSent = rep.dailyReports.reduce((sum, r) => sum + r.connectionsSent, 0);
  const avgReplyRate = totalSent > 0 ? (totalReplies / totalSent) : 0;
  const benchmarkRate = 0.08; // 8% benchmark
  const performanceScore = Math.min(100, (avgReplyRate / benchmarkRate) * 100) * 0.35;

  // 3. Professionalism Score (20%)
  const avgQA = rep.qaScores.length > 0 
    ? rep.qaScores.reduce((sum, q) => sum + q.score, 0) / rep.qaScores.length 
    : 70;
  const professionalismScore = avgQA * 0.20;

  // 4. Reliability Score (10%)
  // Assuming 22 business days per month = ~66 in 90 days
  const reliabilityScore = Math.min(100, (rep.dailyReports.length / 60) * 100) * 0.10;

  const totalTrustScore = Math.round(complianceScore + performanceScore + professionalismScore + reliabilityScore);
  
  await prisma.repProfile.update({
    where: { id: repId },
    data: { trustScore: totalTrustScore }
  });

  return totalTrustScore;
}

/**
 * Updates rep tier based on requirements in Section 5.5
 */
export async function updateRepTier(repId: string) {
  const rep = await prisma.repProfile.findUnique({
    where: { id: repId },
    include: {
      user: { select: { createdAt: true } },
      _count: { select: { campaigns: true } }
    }
  });

  if (!rep) return;

  const daysActive = Math.floor((Date.now() - new Date(rep.user.createdAt).getTime()) / (24 * 60 * 60 * 1000));
  const score = rep.trustScore;
  
  let newTier = rep.tier;

  // Progression Logic
  if (rep.tier === 'BRONZE' && daysActive >= 90 && score >= 65) {
    newTier = 'SILVER';
  } else if (rep.tier === 'SILVER' && daysActive >= 180 && score >= 75) {
    newTier = 'GOLD';
  } else if (rep.tier === 'GOLD' && daysActive >= 365 && score >= 85) {
    newTier = 'ELITE';
  }

  // Downgrade Logic
  if (rep.tier === 'SILVER' && score < 55) {
    newTier = 'BRONZE';
  } else if (rep.tier === 'GOLD' && score < 65) {
    newTier = 'SILVER';
  } else if (rep.tier === 'ELITE' && score < 75) {
    newTier = 'GOLD';
  }

  if (newTier !== rep.tier) {
    await prisma.repProfile.update({
      where: { id: repId },
      data: { tier: newTier }
    });
  }
}
