import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import type { Role } from "@prisma/client";

export async function createUser(params: {
  email: string;
  name: string;
  password: string;
  role: Role;
}) {
  const existing = await prisma.user.findUnique({ where: { email: params.email } });
  if (existing) throw new Error("Email sudah terdaftar");

  const hashedPassword = await bcrypt.hash(params.password, 10);
  return prisma.user.create({
    data: { ...params, password: hashedPassword },
    select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true, updatedAt: true },
  });
}

export async function updateUser(
  id: string,
  params: { role?: Role; isActive?: boolean; name?: string }
) {
  return prisma.user.update({
    where: { id },
    data: params,
    select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true, updatedAt: true },
  });
}

export async function getAllUsers() {
  return prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true, updatedAt: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function getActiveMembers() {
  return prisma.user.findMany({
    where: { role: "MEMBER", isActive: true },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });
}

export async function verifyCredentials(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;
  if (!user.isActive) return { error: "inactive" as const };

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}
