import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// GET /api/cron/cleanup
// This endpoint deletes complaints older than 1 year.
export async function GET() {
  try {
    const expiredComplaints = await prisma.complaint.findMany({
      where: {
        expiresAt: { lte: new Date() }
      }
    });

    let deletedCount = 0;

    for (const complaint of expiredComplaints) {
      // 1. Delete image from local storage
      if (complaint.proofImageUrl) {
        const filePath = path.join(process.cwd(), 'public', complaint.proofImageUrl);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      // 2. Delete complaint (cascades remarks & escalations via schema definition)
      await prisma.complaint.delete({
        where: { id: complaint.id }
      });
      
      deletedCount++;
    }

    return NextResponse.json({ ok: true, deletedCount });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
