import { Response, Request } from 'express';
import { ok } from '../lib/response';
import { calculateMatchScore } from '../services/matching.service';
import prisma from '../lib/database';

export class RepController {
  async listReps(req: Request, res: Response) {
    const { 
      industry, 
      country, 
      minFollowers, 
      maxFollowers, 
      sort, 
      page = 1, 
      limit = 20,
      clientPreferences 
    } = req.query;

    const where: any = {
      idVerified: true,
      onboardingStep: 7, // Fully onboarded only
      availabilityStatus: 'available',
      ...(industry && { industry: { contains: industry as string, mode: 'insensitive' } }),
      ...(country && { locationCountry: country as string }),
      ...(minFollowers && { linkedinFollowers: { gte: Number(minFollowers) } }),
      ...(maxFollowers && { linkedinFollowers: { lte: Number(maxFollowers) } }),
    };

    const [reps, total] = await Promise.all([
      prisma.repProfile.findMany({
        where,
        orderBy: sort === 'followers'
          ? { linkedinFollowers: 'desc' }
          : { rating: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
          select: {
          id: true,
          linkedinUrl: true,
          linkedinFollowers: true,
          industry: true,
          locationCountry: true,
          locationCity: true,
          bio: true,
          rating: true,
          totalReviews: true,
          availabilityStatus: true,
          maxClients: true,
          hourlyRateUsd: true,
          // NEVER return: idDocumentUrl, gologinProfileId, userId
        }
      }),
      prisma.repProfile.count({ where })
    ]);

    // Calculate match scores if client preferences provided
    let repsWithScores = reps;
    if (clientPreferences) {
      try {
        const prefs = JSON.parse(clientPreferences as string);
        repsWithScores = reps.map((rep: any) => ({
          ...rep,
          matchScore: calculateMatchScore(rep, prefs)
        }));
      } catch (error) {
        // Invalid client preferences, continue without scores
      }
    }

    return ok(res, repsWithScores, { 
      page: Number(page), 
      total, 
      perPage: Number(limit) 
    });
  }

  async getRepById(req: Request, res: Response) {
    const { id } = req.params;

    const rep = await prisma.repProfile.findUnique({
      where: { id },
      select: {
        id: true,
        linkedinUrl: true,
        linkedinFollowers: true,
        industry: true,
        locationCountry: true,
        locationCity: true,
        bio: true,
        rating: true,
        totalReviews: true,
        availabilityStatus: true,
        maxClients: true,
        hourlyRateUsd: true,
        createdAt: true
      }
    });

    if (!rep) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Rep not found',
          statusCode: 404
        }
      });
    }

    return ok(res, rep);
  }
}
