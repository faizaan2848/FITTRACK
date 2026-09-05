import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductRequest } from "../../services/productService";
import { addToCartRequest } from "../../services/cartService";
import { toggleWishlistRequest } from "../../services/wishlistService";
import { useCart } from "../../context/CartContext";
import { formatINR } from "../../utils/currency";
import styles from "./marketplace.module.css";

const CATEGORY_ICONS = {
  PROTEIN: "🥤", CREATINE: "💊", MASS_GAINER: "🥛", PRE_WORKOUT: "⚡",
  SHAKER: "🧴", GYM_BAG: "🎒", RESISTANCE_BAND: "➰", DUMBBELL: "🏋️",
  GYM_EQUIPMENT: "🏋️",
};

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refreshCartCount } = useCart();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    setLoadError(null);
    getProductRequest(id).then(setProduct).catch(() => {
      setLoadError("This product doesn't exist or was removed.");
    });
  }, [id]);

  async function handleAddToCart() {
    setMessage(null);
    try {
      await addToCartRequest(product.id, quantity);
      refreshCartCount();
      setMessage("Added to cart!");
    } catch (err) {
      setMessage(err.response?.data?.error?.message || "Unable to add to cart");
    }
  }

  async function handleToggleWishlist() {
    const { isWishlisted: newState } = await toggleWishlistRequest(product.id);
    setIsWishlisted(newState);
  }

  if (loadError) {
    return (
      <div className={styles.page}>
        <button className={styles.qtyBtn} style={{ width: "auto", padding: "8px 14px", marginBottom: "var(--space-4)" }} onClick={() => navigate(-1)}>
          ← Back
        </button>
        <div className={styles.emptyState}>{loadError}</div>
      </div>
    );
  }

  if (!product) {
    return <div className={styles.page}>Loading...</div>;
  }

  const soldOut = (product.stock ?? 0) <= 0;
  const maxQty = Math.max(1, product.stock ?? 1);

  return (
    <div className={styles.page}>
      <button className={styles.qtyBtn} style={{ width: "auto", padding: "8px 14px", marginBottom: "var(--space-4)" }} onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className={styles.detailLayout}>
        <div className={styles.detailImage}>
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "var(--radius-lg)" }} />
          ) : (
            CATEGORY_ICONS[product.category] || "🏷️"
          )}
        </div>

        <div>
          <div className={styles.categoryTag}>{product.category.replace("_", " ")}</div>
          <div className={styles.detailTitle}>{product.name}</div>
          <div className={styles.detailPrice}>{formatINR(product.price)}</div>
          <div className={styles.rating}>⭐ {product.rating.toFixed(1)} · {soldOut ? "sold out" : `${product.stock} in stock`}</div>
          {soldOut && <div className={styles.soldOutBadge}>Sold out</div>}
          <p className={styles.detailDesc}>{product.description}</p>

          <div className={styles.sellerBox}>
            <div className={styles.sellerHeading}>Seller details</div>
            <div className={styles.sellerRow}>
              <span className={styles.sellerLabel}>Name:</span>{" "}
              {product.createdBy?.name || "FitTrack Catalog"}
            </div>
            <div className={styles.sellerRow}>
              <span className={styles.sellerLabel}>WhatsApp:</span>{" "}
              {product.sellerWhatsapp ? (
                <a
                  href={`https://wa.me/${product.sellerWhatsapp.replace(/^\+/, "")}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {product.sellerWhatsapp}
                </a>
              ) : (
                <span style={{ color: "var(--color-text-muted)" }}>Not provided</span>
              )}
            </div>
            <div className={styles.sellerRow}>
              <span className={styles.sellerLabel}>State:</span>{" "}
              {product.sellerState || (
                <span style={{ color: "var(--color-text-muted)" }}>Not provided</span>
              )}
            </div>
            {product.sellerQrImageUrl ? (
              <img
                src={product.sellerQrImageUrl}
                alt="Seller payment QR"
                className={styles.sellerQr}
              />
            ) : (
              <div style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>
                No payment QR added by this seller.
              </div>
            )}
          </div>

          <div className={styles.qtyRow}>
            <button className={styles.qtyBtn} disabled={soldOut} onClick={() => setQuantity((q) => Math.max(1, q - 1))}>−</button>
            <div className={styles.qtyValue}>{quantity}</div>
            <button className={styles.qtyBtn} disabled={soldOut} onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}>+</button>
          </div>

          <div className={styles.cardActions}>
            <button className={styles.addBtn} disabled={soldOut} onClick={handleAddToCart}>
              {soldOut ? "Sold Out" : "Add to Cart"}
            </button>
            <button className={styles.wishlistBtn} onClick={handleToggleWishlist}>
              {isWishlisted ? "❤️ Wishlisted" : "🤍 Wishlist"}
            </button>
          </div>

          {message && <div style={{ color: "var(--color-primary)", marginTop: "var(--space-3)", fontWeight: 600 }}>{message}</div>}
        </div>
      </div>

      <div style={{ marginTop: "var(--space-6)" }}>
        <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.25rem", marginBottom: "var(--space-3)" }}>Reviews</h2>
        {product.reviews.length === 0 ? (
          <div className={styles.emptyState}>No reviews yet.</div>
        ) : (
          product.reviews.map((r) => (
            <div key={r.id} className={styles.cartItem}>
              <div className={styles.cartItemInfo}>
                <div>⭐ {r.rating}</div>
                {r.comment && <div className={styles.cartItemPrice}>{r.comment}</div>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ProductDetail;
