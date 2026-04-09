import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding large dataset (50 students, 8 admins)...');

  // Wipe existing db just for a clean test state
  await prisma.escalation.deleteMany({});
  await prisma.remark.deleteMany({});
  await prisma.complaint.deleteMany({});
  await prisma.user.deleteMany({});

  const studentNames = [
    "Aarav Sharma", "Aditi Rao", "Advait Gupta", "Akshay Kumar", "Ananya Singh",
    "Arjun Patel", "Bhavya Shah", "Chaitanya Joshi", "Deepak Reddy", "Devika Nair",
    "Esha Verma", "Gautam Iyer", "Hansa Mehra", "Ishaan Malhotra", "Jiya Kapoor",
    "Kabir Das", "Kavya Saxena", "Lakshya Pandey", "Manan Mehta", "Meera Rajput",
    "Naitik Chauhan", "Navya Bhat", "Ojas Kulkarni", "Palak Agarwal", "Pranav Deshmukh",
    "Rhea Singhania", "Rishi Kapoor", "Riya Sen", "Rohan Joshi", "Saanvi Patel",
    "Sahil Khan", "Sanya Mirza", "Shaurya Singh", "Sneha Rao", "Tanvi Sharma",
    "Tushar Gupta", "Utkarsh Verma", "Vaishnavi Iyer", "Varun Dhawan", "Vedant Patil",
    "Vivaan Mehra", "Yash Chopra", "Yuvraj Singh", "Zoya Khan", "Aayush Bansal",
    "Anika Gupta", "Aaryan Khan", "Ishika Agarwal", "Karan Johar", "Sara Ali Khan"
  ];

  const adminNames = [
    "Dr. Rajesh Khanna", "Prof. Sunita Williams", "Dr. Amit Shah", "Ms. Priya Mani",
    "Mr. Sanjay Dutt", "Dr. Neha Kakkar", "Prof. Vijay Mallya", "Ms. Kiran Bedi"
  ];

  // Generate 50 Students
  console.log('Generating 50 students...');
  for (let i = 0; i < 50; i++) {
    const year = 2021 + Math.floor(Math.random() * 4); // 2021-2024
    const idNum = String(100 + i).padStart(3, '0');
    const collegeId = `KU${year}${idNum}`;
    const email = `student${i + 1}@fake.karnavati.edu.in`;
    const fullName = studentNames[i] || `Student ${i + 1}`;

    await prisma.user.create({
      data: {
        collegeId,
        email,
        fullName,
        role: 'student',
      },
    });
  }

  // Generate 8 Admins
  const departments = [
    "Hostel Issues",
    "Classroom & Infrastructure Issues",
    "Parking Issues",
    "Transportation Issues",
    "Harassment / Ragging / Safety Issues",
    "General / Other Issues"
  ];

  console.log('Generating 8 admins...');
  for (let i = 0; i < 8; i++) {
    const collegeId = `KUSTAFF${String(i + 1).padStart(3, '0')}`;
    const email = `admin${i + 1}@fake.karnavati.edu.in`;
    const fullName = adminNames[i] || `Staff ${i + 1}`;
    // Rotate through departments
    const department = departments[i % departments.length];

    await prisma.user.create({
      data: {
        collegeId,
        email,
        fullName,
        role: 'admin',
        department: department
      },
    });
  }

  console.log('Seeding finished. Generated 50 students and 8 admins.');
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
