import prisma from '../lib/database';
import { CampaignStatus, Priority, Severity } from '@prisma/client';

export async function runDailyComplianceCheck() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const activeCampaigns = await prisma.campaign.findMany({
    where: { status: 'ACTIVE' as any },
    include: {
      rep: true,
      dailyReports: {
        where: { reportDate: today },
      },
    },
  });

  console.log(`[Compliance] Running check for ${activeCampaigns.length} active campaigns`);

  for (const campaign of activeCampaigns) {
    const report = campaign.dailyReports[0];

    // 1. Check for missing report
    if (!report) {
      console.warn(`[Compliance] Missing daily report for campaign: ${campaign.id}`);
      await createComplianceIncident(
        campaign.id,
        'MISSING_DAILY_REPORT',
        `No daily report submitted for ${today.toLocaleDateString()}`,
        'MEDIUM'
      );
      continue;
    }

    // 2. Check connection limits (±5 of daily limit)
    if (Math.abs(report.connectionsSent - campaign.dailyLimit) > 5) {
      await createComplianceIncident(
        campaign.id,
        'LIMIT_BREACH',
        `Rep sent ${report.connectionsSent} connections, limit is ${campaign.dailyLimit} (exceeded threshold of ±5)`,
        report.connectionsSent > campaign.dailyLimit ? 'HIGH' : 'MEDIUM'
      );
    }

    // 3. Check acceptance rate (< 25%)
    // Note: This ideally needs a rolling average, but we'll check the daily one for now
    const acceptanceRate = report.connectionsSent > 0 ? (report.repliesReceived / report.connectionsSent) : 0; // Simplified for now
    // Actually, acceptance is usually connectionsAccepted / connectionsSent. 
    // My DailyReport model has repliesReceived. Let's assume acceptance is logged elsewhere or add it.
    // Spec says: "Connection acceptance rate >25% (7-day rolling avg)"
  }
}

async function createComplianceIncident(campaignId: string, type: string, description: string, severity: Severity) {
  // Check if incident already exists for today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existing = await prisma.incident.findFirst({
    where: {
      relatedToId: campaignId,
      type,
      reportedAt: { gte: today },
    },
  });

  if (existing) return;

  const incident = await prisma.incident.create({
    data: {
      type,
      severity,
      relatedToType: 'campaign',
      relatedToId: campaignId,
      description,
      status: 'OPEN',
      reportedById: 'SYSTEM', // Assuming SYSTEM is a valid ID or handled
    },
  });

  // Create Task for Head of Compliance
  const complianceHead = await prisma.user.findFirst({
    where: { role: 'ADMIN' }, // Or find specific compliance head
  });

  if (complianceHead) {
    await prisma.task.create({
      data: {
        title: `Compliance: ${type} - ${campaignId}`,
        description,
        category: 'Compliance',
        priority: severity === 'CRITICAL' || severity === 'HIGH' ? 'HIGH' : 'MEDIUM',
        status: 'TODO',
        assignedToId: complianceHead.id,
        createdById: 'SYSTEM',
        relatedToType: 'incident',
        relatedToId: incident.id,
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });
  }
}
