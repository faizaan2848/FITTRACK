import { asyncHandler } from "../utils/asyncHandler.js";
import { listProducts, getProduct, createProduct } from "../services/productService.js";

export const getProducts = asyncHandler(async (req, res) => {
  const { category, search, sortBy } = req.query;
  const products = await listProducts({ category, search, sortBy });
  res.status(200).json({ products });
});

export const getProductById = asyncHandler(async (req, res) => {
  const product = await getProduct(req.params.id);
  res.status(200).json({ product });
});

export const postProduct = asyncHandler(async (req, res) => {
  const product = await createProduct(req.user.sub, req.body);
  res.status(201).json({ product });
});
