import { Link } from "react-router-dom";
import { formatINR } from "../../utils/currency";
import styles from "../../pages/marketplace/marketplace.module.css";

const CATEGORY_ICONS = {
  PROTEIN: "🥤", CREATINE: "💊", MASS_GAINER: "🥛", PRE_WORKOUT: "⚡",
  SHAKER: "🧴", GYM_BAG: "🎒", RESISTANCE_BAND: "➰", DUMBBELL: "🏋️",
  GYM_EQUIPMENT: "🏋️",
};

function ProductCard({ product, onAddToCart, onToggleWishlist, isWishlisted, index = 0 }) {
  const soldOut = (product.stock ?? 0) <= 0;
  return (
    <div className={`${styles.productCard} fadeIn`} style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}>
      <Link to={`/marketplace/${product.id}`} style={{ textDecoration: "none", color: "inherit" }}>
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className={styles.productImage} />
        ) : (
          <div className={styles.productImagePlaceholder}>{CATEGORY_ICONS[product.category] || "🏷️"}</div>
        )}
        <div className={styles.categoryTag}>{product.category.replace("_", " ")}</div>
        <div className={styles.productName}>{product.name}</div>
        <div className={styles.productDesc}>{product.description}</div>
        <div className={styles.productFooter}>
          <div className={styles.price}>{formatINR(product.price)}</div>
          <div className={styles.rating}>⭐ {product.rating.toFixed(1)}</div>
        </div>
        {soldOut && <div className={styles.soldOutBadge}>Sold out</div>}
      </Link>
      <div className={styles.cardActions}>
        <button
          className={styles.addBtn}
          onClick={() => onAddToCart(product.id)}
          disabled={soldOut}
          title={soldOut ? "This item is sold out" : "Add to cart"}
        >
          {soldOut ? "Sold Out" : "Add to Cart"}
        </button>
        <button
          className={styles.wishlistBtn}
          onClick={() => onToggleWishlist(product.id)}
          aria-label="Toggle wishlist"
        >
          {isWishlisted ? "❤️" : "🤍"}
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
