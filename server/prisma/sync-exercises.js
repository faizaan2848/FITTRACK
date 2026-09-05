// One-off: upsert exercise guides without touching products/users/meals.
// Run with: node prisma/sync-exercises.js
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { EXERCISE_GUIDES } from "./exerciseGuides.js";

const prisma = new PrismaClient();

async function main() {
  let updated = 0;
  let created = 0;
  for (const ex of EXERCISE_GUIDES) {
    const existing = await prisma.exercise.findFirst({ where: { name: ex.name } });
    if (existing) {
      await prisma.exercise.update({ where: { id: existing.id }, data: ex });
      updated++;
    } else {
      await prisma.exercise.create({ data: ex });
      created++;
    }
  }
  console.log(`Done. Updated: ${updated}, Created: ${created}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
