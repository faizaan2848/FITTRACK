import { asyncHandler } from "../utils/asyncHandler.js";
import {
  checkout,
  listOrders,
  listSales,
  markPaymentSent,
  confirmPaymentReceived,
} from "../services/orderService.js";

export const postCheckout = asyncHandler(async (req, res) => {
  const order = await checkout(req.user.sub);
  res.status(201).json({ order });
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await listOrders(req.user.sub);
  res.status(200).json({ orders });
});

export const getMySales = asyncHandler(async (req, res) => {
  const orders = await listSales(req.user.sub);
  res.status(200).json({ orders });
});

export const postMarkPaid = asyncHandler(async (req, res) => {
  const order = await markPaymentSent(req.user.sub, req.params.itemId);
  res.status(200).json({ order });
});

export const postConfirmReceived = asyncHandler(async (req, res) => {
  const order = await confirmPaymentReceived(req.user.sub, req.params.itemId);
  res.status(200).json({ order });
});
