const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const s = await prisma.user.findMany({ where: { role: 'student' }, take: 3 });
  const a = await prisma.user.findMany({ where: { role: 'admin' }, take: 3 });
  console.log('--- STUDENTS ---');
  s.forEach(u => console.log(`ID: ${u.collegeId} | Email: ${u.email}`));
  console.log('--- ADMINS ---');
  a.forEach(u => console.log(`ID: ${u.collegeId} | Email: ${u.email}`));
}
run().finally(() => prisma.$disconnect());
