import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getWishlistRequest, toggleWishlistRequest } from "../../services/wishlistService";
import { addToCartRequest } from "../../services/cartService";
import { useCart } from "../../context/CartContext";
import { formatINR } from "../../utils/currency";
import styles from "./marketplace.module.css";

function Wishlist() {
  const { refreshCartCount } = useCart();
  const [items, setItems] = useState(null);

  async function load() {
    setItems(await getWishlistRequest());
  }

  useEffect(() => {
    load();
  }, []);

  async function handleRemove(productId) {
    await toggleWishlistRequest(productId);
    load();
  }

  async function handleAddToCart(productId) {
    await addToCartRequest(productId);
    refreshCartCount();
  }

  if (!items) {
    return <div className={styles.page}>Loading...</div>;
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle} style={{ marginBottom: "var(--space-4)" }}>Your Wishlist</h1>

      {items.length === 0 ? (
        <div className={styles.emptyState}>
          Nothing here yet. <Link to="/marketplace">Browse the marketplace</Link>.
        </div>
      ) : (
        items.map(({ product }) => (
          <div key={product.id} className={styles.cartItem}>
            <div className={styles.cartItemInfo}>
              <div className={styles.cartItemName}>{product.name}</div>
              <div className={styles.cartItemPrice}>{formatINR(product.price)}</div>
            </div>
            <div className={styles.cardActions}>
              <button className={styles.addBtn} onClick={() => handleAddToCart(product.id)}>Add to Cart</button>
              <button className={styles.wishlistBtn} onClick={() => handleRemove(product.id)}>✕</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default Wishlist;
