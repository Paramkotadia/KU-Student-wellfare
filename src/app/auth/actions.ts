"use server";

import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

export async function checkIdAction(collegeId: string, email: string, expectedRole: string) {
  const user = await prisma.user.findUnique({
    where: { collegeId }
  });

  if (!user) {
    return { error: 'ID not found in University Database.' };
  }

  // Verification step matching the exact email attached to the ID in the dataset
  if (!user.email || user.email.toLowerCase() !== email.toLowerCase()) {
    return { error: 'The provided Email does not match the registered College ID.' };
  }

  if (user.role !== expectedRole) {
    return { error: `This ID is for a different role (${user.role}).` };
  }

  return { ok: true, isRegistered: !!user.passwordHash, fullName: user.fullName };
}

export async function loginAction(collegeId: string, passwordHash: string) {
  // Simplistic local auth skipping actual BCrypt since we're localizing for ease.
  const user = await prisma.user.findUnique({
    where: { collegeId }
  });

  if (!user || user.passwordHash !== passwordHash) {
    return { error: 'Invalid ID or password.' };
  }

  const cookieStore = await cookies();
  cookieStore.set('session', user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/',
  });

  return { ok: true };
}

export async function registerAction(
  collegeId: string, 
  fullName: string, 
  passwordHash: string,
  department?: string
) {
  try {
    const user = await prisma.user.update({
      where: { collegeId },
      data: {
        fullName,
        passwordHash,
        department,
        isVerified: true
      }
    });

    const cookieStore = await cookies();
    cookieStore.set('session', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return { ok: true };
  } catch (error: any) {
    return { error: error.message || 'Error occurred during registration.' };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
  return { ok: true };
}
