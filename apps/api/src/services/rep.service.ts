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
