import { asyncHandler } from "../utils/asyncHandler.js";
import { getWishlist, toggleWishlist } from "../services/wishlistService.js";

export const getMyWishlist = asyncHandler(async (req, res) => {
  const wishlist = await getWishlist(req.user.sub);
  res.status(200).json({ wishlist });
});

export const toggleWishlistItem = asyncHandler(async (req, res) => {
  const result = await toggleWishlist(req.user.sub, req.params.productId);
  res.status(200).json(result);
});
