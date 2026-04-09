"use server";

import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const prisma = new PrismaClient();

export async function getUserSession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('session')?.value;
  if (!sessionId) return null;

  const user = await prisma.user.findUnique({
    where: { id: sessionId }
  });
  return user;
}

export async function submitComplaintAction(formData: FormData) {
  const user = await getUserSession();
  if (!user || user.role !== 'student') {
    return { error: 'Unauthorized.' };
  }

  // Check if they already have an active complaint
  const activeComplaint = await prisma.complaint.findFirst({
    where: {
      studentId: user.id,
      status: { in: ['pending', 'in_progress', 'overdue'] }
    }
  });

  if (activeComplaint) {
    return { error: 'You already have an active complaint. Please wait for it to be resolved.' };
  }

  const category = formData.get('category') as string;
  const description = formData.get('description') as string;
  const incidentDateObj = new Date(formData.get('incidentDate') as string);
  const file = formData.get('proofImage') as File;

  if (description.length < 50) {
    return { error: 'Description must be at least 50 characters.' };
  }

  let proofImageUrl = null;
  
  if (file && file.size > 0) {
    if (file.size > 5 * 1024 * 1024) {
      return { error: 'Image must be less than 5MB.' };
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', user.id);
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const ext = path.extname(file.name) || '.jpg';
    const filename = `${crypto.randomBytes(8).toString('hex')}${ext}`;
    const filePath = path.join(uploadsDir, filename);

    fs.writeFileSync(filePath, buffer);
    proofImageUrl = `/uploads/${user.id}/${filename}`;
  }

  const createdAt = new Date();
  const deadline = new Date(createdAt);
  deadline.setDate(deadline.getDate() + 7);
  
  const expiresAt = new Date(createdAt);
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);

  await prisma.complaint.create({
    data: {
      studentId: user.id,
      category,
      description,
      proofImageUrl,
      incidentDate: incidentDateObj,
      status: 'pending',
      createdAt,
      deadline,
      expiresAt,
    }
  });

  revalidatePath('/student/dashboard');
  return { ok: true };
}

export async function getStudentComplaints() {
  const user = await getUserSession();
  if (!user) return [];

  // Filter for last 1 year (Cron ideally deletes, but we enforce read query too)
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  return prisma.complaint.findMany({
    where: { 
      studentId: user.id,
      createdAt: { gte: oneYearAgo }
    },
    include: {
      remarks: true
    },
    orderBy: { createdAt: 'desc' }
  });
}
