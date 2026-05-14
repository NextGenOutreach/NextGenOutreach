import { PrismaClient, UserRole, UserStatus, CampaignStatus, CampaignType } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Create Admin User
  const adminPasswordHash = await bcrypt.hash('Admin123!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@nextgenoutreach.co.za' },
    update: {},
    create: {
      email: 'admin@nextgenoutreach.co.za',
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });
  console.log('✅ Admin user created');

  // 2. Create some initial Reps (Agents)
  const reps = [
    {
      email: 'thabo.rep@example.com',
      firstName: 'Thabo',
      lastName: 'Molefe',
      industry: 'Technology',
      followers: 12500,
      country: 'ZA',
      bio: 'Expert in SaaS outreach and LinkedIn networking.',
    },
    {
      email: 'sarah.rep@example.com',
      firstName: 'Sarah',
      lastName: 'Jenkins',
      industry: 'Healthcare',
      followers: 8200,
      country: 'ZA',
      bio: 'Specializing in medical device sales and networking.',
    },
    {
      email: 'lerato.rep@example.com',
      firstName: 'Lerato',
      lastName: 'Dlamini',
      industry: 'Finance',
      followers: 15400,
      country: 'ZA',
      bio: 'Helping financial firms grow their LinkedIn presence.',
    }
  ];

  for (const r of reps) {
    const passHash = await bcrypt.hash('Rep123!', 12);
    const user = await prisma.user.upsert({
      where: { email: r.email },
      update: {},
      create: {
        email: r.email,
        passwordHash: passHash,
        role: UserRole.REP,
        status: UserStatus.ACTIVE,
        repProfile: {
          create: {
            linkedinUrl: `https://linkedin.com/in/${r.firstName.toLowerCase()}`,
            linkedinFollowers: r.followers,
            industry: r.industry,
            locationCountry: r.country,
            bio: r.bio,
            availabilityStatus: 'available',
            idVerified: true,
            rating: 4.8,
          }
        }
      }
    });
  }
  console.log('✅ Initial Reps created');

  console.log('🚀 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
