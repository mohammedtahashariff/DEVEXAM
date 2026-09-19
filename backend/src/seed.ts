import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Initialising Dev Exam database...');

  // Clean all tables in dependency order
  await prisma.proctoringEvent.deleteMany({});
  await prisma.candidateAnswer.deleteMany({});
  await prisma.candidateAttempt.deleteMany({});
  await prisma.testCase.deleteMany({});
  await prisma.question.deleteMany({});
  await prisma.assessment.deleteMany({});
  await prisma.candidateAccount.deleteMany({});
  await prisma.user.deleteMany({});

  // Create the default admin account
  const adminPasswordHash = await bcrypt.hash('Sivaram@0987', 10);
  await prisma.user.create({
    data: {
      email: 'sivaram@devlustro.com',
      name: 'Sivaram',
      passwordHash: adminPasswordHash,
      role: 'ADMIN'
    }
  });

  console.log('✅ Created admin: sivaram@devlustro.com');
  console.log('🎉 Database ready. No demo data seeded.');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
