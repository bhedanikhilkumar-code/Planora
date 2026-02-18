import { prisma } from '../utils/prisma.js';

export const audit = async (adminId: string, action: string, targetType: string, targetId: string, ip: string, metadata?: object) => {
  await prisma.auditLog.create({ data: { adminId, action, targetType, targetId, ip, metadata } });
};
