import { asyncHandler } from "../utils/asyncHandler.js";
import {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeCartItem,
} from "../services/cartService.js";

export const getMyCart = asyncHandler(async (req, res) => {
  const cart = await getCart(req.user.sub);
  res.status(200).json(cart);
});

export const postCartItem = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const qty = quantity == null ? 1 : Number(quantity);
  if (!productId) {
    throw new ApiError(422, "productId is required");
  }
  if (!Number.isInteger(qty) || qty <= 0) {
    throw new ApiError(422, "Quantity must be a positive whole number");
  }
  const item = await addToCart(req.user.sub, productId, qty);
  res.status(201).json({ item });
});

export const putCartItem = asyncHandler(async (req, res) => {
  const qty = Number(req.body.quantity);
  if (!Number.isInteger(qty) || qty <= 0) {
    throw new ApiError(422, "Quantity must be a positive whole number");
  }
  const item = await updateCartItemQuantity(req.user.sub, req.params.id, qty);
  res.status(200).json({ item });
});

export const deleteCartItem = asyncHandler(async (req, res) => {
  await removeCartItem(req.user.sub, req.params.id);
  res.status(204).send();
});
