import { prisma } from "../config/prisma.js";
import { ApiError } from "../utils/ApiError.js";

export async function getCart(userId) {
  const items = await prisma.cartItem.findMany({
    where: { userId },
    include: { product: true },
    orderBy: { createdAt: "asc" },
  });

  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return { items, total: Number(total.toFixed(2)) };
}

export async function addToCart(userId, productId, quantity = 1) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    throw new ApiError(404, "Product not found");
  }
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new ApiError(422, "Quantity must be a positive whole number");
  }
  if (product.stock <= 0) {
    throw new ApiError(422, `"${product.name}" is sold out`);
  }

  const existing = await prisma.cartItem.findUnique({
    where: { userId_productId: { userId, productId } },
  });

  if (existing) {
    const nextQty = existing.quantity + quantity;
    if (nextQty > product.stock) {
      throw new ApiError(422, `Only ${product.stock} left of "${product.name}"`);
    }
    return prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: nextQty },
      include: { product: true },
    });
  }

  if (quantity > product.stock) {
    throw new ApiError(422, `Only ${product.stock} left of "${product.name}"`);
  }

  return prisma.cartItem.create({
    data: { userId, productId, quantity },
    include: { product: true },
  });
}

export async function updateCartItemQuantity(userId, cartItemId, quantity) {
  const item = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
    include: { product: true },
  });
  if (!item || item.userId !== userId) {
    throw new ApiError(404, "Cart item not found");
  }

  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new ApiError(422, "Quantity must be a positive whole number");
  }
  if (item.product && quantity > item.product.stock) {
    throw new ApiError(
      422,
      item.product.stock === 0
        ? `"${item.product.name}" is sold out`
        : `Only ${item.product.stock} left of "${item.product.name}"`
    );
  }

  return prisma.cartItem.update({
    where: { id: cartItemId },
    data: { quantity },
    include: { product: true },
  });
}

export async function removeCartItem(userId, cartItemId) {
  const item = await prisma.cartItem.findUnique({ where: { id: cartItemId } });
  if (!item || item.userId !== userId) {
    throw new ApiError(404, "Cart item not found");
  }
  await prisma.cartItem.delete({ where: { id: cartItemId } });
}

export async function clearCart(userId) {
  await prisma.cartItem.deleteMany({ where: { userId } });
}
