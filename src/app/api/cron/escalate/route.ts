import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { differenceInDays } from 'date-fns';

const prisma = new PrismaClient();

// GET /api/cron/escalate
// This endpoint checks for complaints past their 7-day deadline and marks them overdue.
export async function GET() {
  try {
    const activeComplaints = await prisma.complaint.findMany({
      where: {
        status: { in: ['pending', 'in_progress'] }
      }
    });

    const now = new Date();
    let escalatedCount = 0;

    for (const complaint of activeComplaints) {
      if (now > complaint.deadline) {
        // Mark as overdue
        await prisma.complaint.update({
          where: { id: complaint.id },
          data: { status: 'overdue' }
        });

        // Add escalation record
        await prisma.escalation.create({
          data: {
            complaintId: complaint.id,
            reason: `Past the 7-day resolution window (submitted ${complaint.createdAt.toISOString()})`,
            escalatedAt: now,
          }
        });
        
        escalatedCount++;
      }
    }

    return NextResponse.json({ ok: true, escalatedCount });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
