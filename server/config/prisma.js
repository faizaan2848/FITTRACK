// Single shared PrismaClient instance. Every controller/service imports
// `prisma` from here instead of instantiating `new PrismaClient()` itself,
// which would exhaust database connections under nodemon's hot reload.

import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();
