import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { getProductsRequest } from "../../services/productService";
import { addToCartRequest } from "../../services/cartService";
import { getWishlistRequest, toggleWishlistRequest } from "../../services/wishlistService";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";
import ProductCard from "../../components/marketplace/ProductCard";
import styles from "./marketplace.module.css";

const CATEGORIES = [
  "ALL", "PROTEIN", "CREATINE", "MASS_GAINER", "PRE_WORKOUT", "SHAKER",
  "GYM_BAG", "RESISTANCE_BAND", "DUMBBELL", "GYM_EQUIPMENT",
];

function Marketplace() {
  const { refreshCartCount } = useCart();
  const { showToast } = useToast();
  const [products, setProducts] = useState([]);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [sortBy, setSortBy] = useState("newest");
  const [isLoading, setIsLoading] = useState(true);

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getProductsRequest({
        category: category === "ALL" ? undefined : category,
        search: search || undefined,
        sortBy,
      });
      setProducts(data);
    } finally {
      setIsLoading(false);
    }
  }, [category, search, sortBy]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    getWishlistRequest().then((items) => {
      setWishlistIds(new Set(items.map((w) => w.product.id)));
    });
  }, []);

  async function handleAddToCart(productId, productName) {
    try {
      await addToCartRequest(productId);
      refreshCartCount();
      showToast(`${productName} added to cart`, "success");
    } catch (err) {
      showToast(err.response?.data?.error?.message || "Unable to add to cart", "error");
    }
  }

  async function handleToggleWishlist(productId) {
    const willBeWishlisted = !wishlistIds.has(productId);
    setWishlistIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
    try {
      await toggleWishlistRequest(productId);
      showToast(willBeWishlisted ? "Added to wishlist" : "Removed from wishlist", "info");
    } catch {
      setWishlistIds((prev) => {
        const next = new Set(prev);
        if (next.has(productId)) next.delete(productId);
        else next.add(productId);
        return next;
      });
      showToast("Unable to update wishlist", "error");
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Marketplace</h1>
        <Link to="/marketplace/new" className={styles.addBtn} style={{ textDecoration: "none", padding: "9px 16px" }}>
          + Add Product
        </Link>
      </div>

      <div className={styles.controls}>
        <input
          className={styles.searchInput}
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className={styles.select} value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c === "ALL" ? "All Categories" : c.replace("_", " ")}</option>
          ))}
        </select>
        <select className={styles.select} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="rating">Top Rated</option>
        </select>
      </div>

      {isLoading ? (
        <div className={styles.emptyState}>Loading products...</div>
      ) : products.length === 0 ? (
        <div className={styles.emptyState}>No products found.</div>
      ) : (
        <div className={styles.grid}>
          {products.map((p, i) => (
            <ProductCard
              key={p.id}
              product={p}
              index={i}
              onAddToCart={() => handleAddToCart(p.id, p.name)}
              onToggleWishlist={handleToggleWishlist}
              isWishlisted={wishlistIds.has(p.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Marketplace;
