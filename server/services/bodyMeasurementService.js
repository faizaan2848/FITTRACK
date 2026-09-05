import { prisma } from "../config/prisma.js";

export async function addBodyMeasurement(userId, { weight, bodyFatPct, waist, neck, hip }) {
  return prisma.bodyMeasurement.create({
    data: {
      userId,
      weight: weight != null ? Number(weight) : null,
      bodyFatPct: bodyFatPct != null ? Number(bodyFatPct) : null,
      waist: waist != null ? Number(waist) : null,
      neck: neck != null ? Number(neck) : null,
      hip: hip != null ? Number(hip) : null,
    },
  });
}

export async function listBodyMeasurements(userId, { limit = 30 } = {}) {
  return prisma.bodyMeasurement.findMany({
    where: { userId },
    orderBy: { recordedAt: "desc" },
    take: limit,
  });
}
