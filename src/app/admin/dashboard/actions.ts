"use server";

import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { getUserSession } from '@/app/student/dashboard/actions';

const prisma = new PrismaClient();

export async function getAdminDashboardData() {
  const user = await getUserSession();
  
  if (!user || user.role !== 'admin') {
    return { error: 'Unauthorized.' };
  }

  // Find all complaints matching this admin's assigned department
  const complaints = await prisma.complaint.findMany({
    where: { category: user.department || '' },
    include: {
      student: { select: { fullName: true, collegeId: true } },
      remarks: true
    },
    orderBy: { createdAt: 'desc' }
  });

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'pending').length,
    inProgress: complaints.filter(c => c.status === 'in_progress').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
    overdue: complaints.filter(c => c.status === 'overdue').length,
  };

  return { ok: true, complaints, stats, user };
}

export async function updateComplaintStatusAction(
  complaintId: string, 
  newStatus: string, 
  remarkMessage?: string
) {
  const user = await getUserSession();
  if (!user || user.role !== 'admin') return { error: 'Unauthorized.' };

  const complaint = await prisma.complaint.findUnique({ where: { id: complaintId } });
  if (!complaint || complaint.category !== user.department) {
    return { error: 'Complaint not found.' };
  }

  const updateData: any = { 
    status: newStatus,
    adminId: user.id
  };
  
  if (newStatus === 'resolved') {
    updateData.resolvedAt = new Date();
  }

  await prisma.complaint.update({
    where: { id: complaintId },
    data: updateData
  });

  if (remarkMessage && remarkMessage.trim()) {
    await prisma.remark.create({
      data: {
        complaintId,
        adminId: user.id,
        message: remarkMessage.trim()
      }
    });
  }

  revalidatePath('/admin/dashboard');
  revalidatePath('/student/dashboard');
  
  return { ok: true };
}
