import { prisma } from "../config/prisma.js";
import { ApiError } from "../utils/ApiError.js";

export async function getWishlist(userId) {
  return prisma.wishlistItem.findMany({
    where: { userId },
    include: { product: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function toggleWishlist(userId, productId) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  const existing = await prisma.wishlistItem.findUnique({
    where: { userId_productId: { userId, productId } },
  });

  if (existing) {
    await prisma.wishlistItem.delete({ where: { id: existing.id } });
    return { isWishlisted: false };
  }

  await prisma.wishlistItem.create({ data: { userId, productId } });
  return { isWishlisted: true };
}
