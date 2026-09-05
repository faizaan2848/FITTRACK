import { prisma } from "../config/prisma.js";
import { ApiError } from "../utils/ApiError.js";
import { notifyUser } from "./notificationService.js";

const orderInclude = {
  items: {
    include: {
      product: true,
      seller: { select: { id: true, name: true, paymentQrUrl: true } },
    },
  },
};

// Recomputes an order's overall status from its items' payment statuses.
// Kept as a pure function of the items so the two can never drift out
// of sync - Order.status is always a rollup, never an independent value.
function deriveOrderStatus(items) {
  if (items.every((i) => i.paymentStatus === "CONFIRMED")) return "CONFIRMED";
  return "PENDING";
}

export async function checkout(userId) {
  return prisma.$transaction(async (tx) => {
    const cartItems = await tx.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      throw new ApiError(422, "Your cart is empty");
    }

    // Validate stock and reserve it now — decrementing at checkout (not at
    // payment confirmation) so two buyers can't buy the same last unit and
    // a quantity-1 listing flips to sold out as soon as it's purchased.
    for (const item of cartItems) {
      if (!item.product) {
        throw new ApiError(422, "An item in your cart is no longer available");
      }
      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        throw new ApiError(422, `Invalid quantity for "${item.product.name}"`);
      }
      if (item.product.stock < item.quantity) {
        throw new ApiError(
          422,
          item.product.stock === 0
            ? `"${item.product.name}" is sold out`
            : `Only ${item.product.stock} left of "${item.product.name}"`
        );
      }
    }

    const total = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    for (const item of cartItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    const order = await tx.order.create({
      data: {
        userId,
        total: Number(total.toFixed(2)),
        items: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            priceAtPurchase: item.product.price,
            sellerId: item.product.createdByUserId, // null for catalog items
            // Catalog items have no real seller to pay, so they're
            // confirmed immediately. User-listed items need real payment.
            paymentStatus: item.product.createdByUserId ? "AWAITING_PAYMENT" : "CONFIRMED",
          })),
        },
      },
      include: orderInclude,
    });

    const status = deriveOrderStatus(order.items);
    if (status !== order.status) {
      await tx.order.update({ where: { id: order.id }, data: { status } });
    }

    await tx.cartItem.deleteMany({ where: { userId } });

    return { ...order, status };
  });
}

export async function listOrders(userId) {
  return prisma.order.findMany({
    where: { userId },
    include: orderInclude,
    orderBy: { createdAt: "desc" },
  });
}

// Orders where the current user is the SELLER on at least one item -
// this is what powers "Sales" / "items I need to confirm payment for".
export async function listSales(userId) {
  const orders = await prisma.order.findMany({
    where: { items: { some: { sellerId: userId } } },
    include: orderInclude,
    orderBy: { createdAt: "desc" },
  });

  // Trim each order down to just the items this user is actually
  // selling - a buyer shouldn't see line items belonging to other
  // sellers mixed into the same cart checkout.
  return orders.map((order) => ({
    ...order,
    items: order.items.filter((item) => item.sellerId === userId),
  }));
}

async function getOwnedOrderItem(orderItemId) {
  const item = await prisma.orderItem.findUnique({
    where: { id: orderItemId },
    include: { order: true },
  });
  if (!item) {
    throw new ApiError(404, "Order item not found");
  }
  return item;
}

// Buyer action: "I sent the payment via the seller's QR."
export async function markPaymentSent(userId, orderItemId) {
  const item = await getOwnedOrderItem(orderItemId);

  if (item.order.userId !== userId) {
    throw new ApiError(403, "You can only mark your own purchases as paid");
  }
  if (item.paymentStatus !== "AWAITING_PAYMENT") {
    throw new ApiError(422, `Cannot mark as paid from status ${item.paymentStatus}`);
  }

  await prisma.orderItem.update({ where: { id: orderItemId }, data: { paymentStatus: "PAYMENT_SENT" } });

  const order = await prisma.order.findUnique({ where: { id: item.orderId }, include: orderInclude });
  const status = deriveOrderStatus(order.items);
  const updated = await prisma.order.update({ where: { id: order.id }, data: { status }, include: orderInclude });

  const product = await prisma.product.findUnique({ where: { id: item.productId }, select: { name: true } });
  if (item.sellerId) {
    await notifyUser(item.sellerId, "GENERAL", `A buyer marked payment sent for "${product.name}" — check My Sales to confirm.`);
  }

  return updated;
}

// Seller action: "I received the payment."
export async function confirmPaymentReceived(userId, orderItemId) {
  const item = await getOwnedOrderItem(orderItemId);

  if (item.sellerId !== userId) {
    throw new ApiError(403, "You can only confirm payments for your own listings");
  }
  if (item.paymentStatus !== "PAYMENT_SENT") {
    throw new ApiError(422, "Buyer hasn't marked this as paid yet");
  }

  await prisma.orderItem.update({ where: { id: orderItemId }, data: { paymentStatus: "CONFIRMED" } });

  const order = await prisma.order.findUnique({ where: { id: item.orderId }, include: orderInclude });
  const status = deriveOrderStatus(order.items);
  const updated = await prisma.order.update({ where: { id: order.id }, data: { status }, include: orderInclude });

  const product = await prisma.product.findUnique({ where: { id: item.productId }, select: { name: true } });
  await notifyUser(item.order.userId, "GENERAL", `The seller confirmed your payment for "${product.name}".`);

  if (status === "CONFIRMED") {
    await notifyUser(item.order.userId, "GOAL_ACHIEVED", `Your order is fully confirmed — enjoy your gear! 🎉`);
  }

  return updated;
}
