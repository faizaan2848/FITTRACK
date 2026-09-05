import { prisma } from "../config/prisma.js";
import { ApiError } from "../utils/ApiError.js";
import { placeholderImageUrl } from "../utils/placeholderImage.js";
import { getPlanLimits } from "../utils/planLimits.js";

const VALID_CATEGORIES = [
  "PROTEIN", "CREATINE", "MASS_GAINER", "PRE_WORKOUT", "SHAKER",
  "GYM_BAG", "RESISTANCE_BAND", "DUMBBELL", "GYM_EQUIPMENT",
];

export async function listProducts({ category, search, sortBy }) {
  const where = {};
  if (category) where.category = category;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const orderByMap = {
    price_asc: { price: "asc" },
    price_desc: { price: "desc" },
    rating: { rating: "desc" },
    newest: { createdAt: "desc" },
  };

  return prisma.product.findMany({
    where,
    orderBy: orderByMap[sortBy] || { createdAt: "desc" },
  });
}

export async function getProduct(productId) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      reviews: { orderBy: { createdAt: "desc" } },
      createdBy: { select: { id: true, name: true } },
    },
  });
  if (!product) {
    throw new ApiError(404, "Product not found");
  }
  return product;
}

// Any authenticated user can list a product - this app doesn't have an
// admin/seller role system, so it's open the way the exercise library's
// favoriting is: anyone can contribute to the shared catalog.
export async function createProduct(userId, { name, description, category, price, stock, imageUrl, sellerWhatsapp, sellerState, sellerQrImageUrl, sellerUpiId }) {
  if (!name || !String(name).trim() || !description || !String(description).trim()) {
    throw new ApiError(422, "Name and description are required");
  }
  if (!VALID_CATEGORIES.includes(category)) {
    throw new ApiError(422, "Invalid category");
  }
  const priceNum = Number(price);
  if (!Number.isFinite(priceNum) || priceNum <= 0) {
    throw new ApiError(422, "Price must be a number greater than 0");
  }
  const stockNum = stock == null || stock === "" ? 0 : Number(stock);
  if (!Number.isInteger(stockNum) || stockNum < 0) {
    throw new ApiError(422, "Stock must be a whole number of 0 or more");
  }

  // Optional seller contact: normalize and validate WhatsApp number
  // (digits only, 7-15 chars allowing an optional leading +).
  let whatsapp = sellerWhatsapp != null ? String(sellerWhatsapp).replace(/[\s-]/g, "") : null;
  if (whatsapp === "") whatsapp = null;
  if (whatsapp != null && !/^\+?\d{7,15}$/.test(whatsapp)) {
    throw new ApiError(422, "WhatsApp number must be 7-15 digits (optional leading +)");
  }

  let state = sellerState != null ? String(sellerState).trim() : null;
  if (state === "") state = null;
  if (state != null && (state.length < 2 || state.length > 60)) {
    throw new ApiError(422, "State must be 2-60 characters");
  }

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { plan: true } });
  const { maxListings } = getPlanLimits(user.plan);
  const currentListingCount = await prisma.product.count({ where: { createdByUserId: userId } });

  if (maxListings !== null && currentListingCount >= maxListings) {
    throw new ApiError(
      403,
      `Your ${user.plan} plan allows up to ${maxListings} listings. Upgrade to add more.`
    );
  }

  return prisma.product.create({
    data: {
      name: String(name).trim(),
      description: String(description).trim(),
      category,
      price: priceNum,
      stock: stockNum,
      imageUrl: imageUrl || placeholderImageUrl(name),
      rating: 0,
      createdByUserId: userId,
      sellerWhatsapp: whatsapp,
      sellerState: state,
      sellerQrImageUrl: sellerQrImageUrl || null,
      sellerUpiId: sellerUpiId || null,
    },
  });
}
