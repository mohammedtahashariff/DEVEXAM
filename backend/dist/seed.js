"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
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
    const adminPasswordHash = await bcryptjs_1.default.hash('Sivaram@0987', 10);
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
