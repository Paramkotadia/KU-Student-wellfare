import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding large dataset...');

  // Wipe existing db just for a clean test state with emails
  await prisma.escalation.deleteMany({});
  await prisma.remark.deleteMany({});
  await prisma.complaint.deleteMany({});
  await prisma.user.deleteMany({});

  // Generate 20 Random Students
  console.log('Generating students...');
  for (let i = 1; i <= 20; i++) {
    const year = 2020 + Math.floor(Math.random() * 4); // 2020-2023
    const idNum = String(Math.floor(Math.random() * 900) + 100);
    const collegeId = `KU${year}${idNum}`; // e.g. KU2022456
    const email = `student${i}@fake.karnavati.edu.in`;

    await prisma.user.create({
      data: {
        collegeId,
        email,
        role: 'student',
      },
    });
    console.log(`Student -> ID: ${collegeId} | Email: ${email}`);
  }

  // Generate 5 Random Admins
  console.log('Generating admins...');
  for (let i = 1; i <= 5; i++) {
    const collegeId = `KUSTAFF00${i}`;
    const email = `admin${i}@fake.karnavati.edu.in`;

    await prisma.user.create({
      data: {
        collegeId,
        email,
        role: 'admin',
      },
    });
    console.log(`Admin -> ID: ${collegeId} | Email: ${email}`);
  }

  console.log('Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
