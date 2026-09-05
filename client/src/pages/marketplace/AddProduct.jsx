import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createProductRequest } from "../../services/productService";
import { useMembership } from "../../context/MembershipContext";
import styles from "./marketplace.module.css";

const CATEGORIES = [
  "PROTEIN", "CREATINE", "MASS_GAINER", "PRE_WORKOUT", "SHAKER",
  "GYM_BAG", "RESISTANCE_BAND", "DUMBBELL", "GYM_EQUIPMENT",
];

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh",
  "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
  "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha",
  "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Jammu and Kashmir", "Ladakh",
  "Lakshadweep", "Puducherry", "Dadra and Nagar Haveli and Daman and Diu",
  "Other",
];

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function AddProduct() {
  const navigate = useNavigate();
  const { plan, limits, usage, refreshMembership } = useMembership();
  const [form, setForm] = useState({
    name: "", description: "", category: "PROTEIN", price: "", stock: "",
    imageUrl: "", sellerWhatsapp: "", sellerState: "", sellerQrImageUrl: "", sellerUpiId: "",
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [qrPreview, setQrPreview] = useState(null);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const listingCount = usage?.listingCount ?? 0;
  const maxListings = limits.maxListings;
  const atLimit = maxListings != null && listingCount >= maxListings;

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleImageFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Item photo must be an image file.");
      return;
    }
    const dataUrl = await fileToDataUrl(file);
    setImagePreview(dataUrl);
    update("imageUrl", dataUrl);
  }

  async function handleQrFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("QR code must be an image file.");
      return;
    }
    const dataUrl = await fileToDataUrl(file);
    setQrPreview(dataUrl);
    update("sellerQrImageUrl", dataUrl);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!form.name.trim() || !form.description.trim() || !form.price) {
      setError("Name, description, and price are required.");
      return;
    }

    if (!Number.isFinite(Number(form.price)) || Number(form.price) <= 0) {
      setError("Price must be a number greater than 0.");
      return;
    }

    if (form.stock !== "" && (!Number.isInteger(Number(form.stock)) || Number(form.stock) < 0)) {
      setError("Stock must be a whole number of 0 or more.");
      return;
    }

    if (form.sellerWhatsapp.trim() && !/^\+?\d{7,15}$/.test(form.sellerWhatsapp.replace(/[\s-]/g, ""))) {
      setError("WhatsApp number must be 7-15 digits (optional leading +).");
      return;
    }

    setIsSubmitting(true);
    try {
      const product = await createProductRequest({
        ...form,
        price: Number(form.price),
        stock: form.stock ? Number(form.stock) : 0,
        imageUrl: form.imageUrl || undefined,
        sellerWhatsapp: form.sellerWhatsapp.trim() || undefined,
        sellerState: form.sellerState || undefined,
        sellerQrImageUrl: form.sellerQrImageUrl || undefined,
        sellerUpiId: form.sellerUpiId.trim() || undefined,
      });
      await refreshMembership(); // usage count just changed
      navigate(`/marketplace/${product.id}`);
    } catch (err) {
      setError(err.response?.data?.error?.message || "Unable to add product");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={styles.page} style={{ maxWidth: 640 }}>
      <h1 className={styles.pageTitle} style={{ marginBottom: "var(--space-2)" }}>Add a Product</h1>
      <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", marginBottom: "var(--space-4)" }}>
        {listingCount} / {maxListings == null ? "unlimited" : maxListings} listings used on your{" "}
        <strong style={{ color: "var(--color-text)" }}>{plan}</strong> plan.
      </p>

      {atLimit ? (
        <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "var(--space-5)", textAlign: "center" }}>
          <p style={{ marginBottom: "var(--space-3)", color: "var(--color-text-muted)" }}>
            You've hit your {plan} plan's listing limit ({maxListings ?? "unlimited"}). Upgrade to add more.
          </p>
          <Link to="/membership" className={styles.addBtn} style={{ textDecoration: "none", display: "inline-block", padding: "10px 20px" }}>
            View Plans
          </Link>
        </div>
      ) : (
        <>
          {error && <div style={{ color: "#f87171", marginBottom: "var(--space-3)" }}>{error}</div>}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            <input
              className={styles.searchInput}
              placeholder="Product name"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
            />
            <textarea
              className={styles.searchInput}
              style={{ minHeight: 90, fontFamily: "inherit", resize: "vertical" }}
              placeholder="Description"
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
            />
            <select className={styles.select} value={form.category} onChange={(e) => update("category", e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c.replace("_", " ")}</option>
              ))}
            </select>
            <div style={{ display: "flex", gap: "var(--space-3)" }}>
              <input
                className={styles.searchInput}
                type="number"
                min="1"
                placeholder="Price (₹)"
                value={form.price}
                onChange={(e) => update("price", e.target.value)}
              />
              <input
                className={styles.searchInput}
                type="number"
                placeholder="Stock quantity"
                value={form.stock}
                onChange={(e) => update("stock", e.target.value)}
              />
            </div>

            <div className={styles.sellerGrid}>
              <input
                className={styles.searchInput}
                placeholder="WhatsApp number (e.g. 9876543210)"
                inputMode="tel"
                value={form.sellerWhatsapp}
                onChange={(e) => update("sellerWhatsapp", e.target.value)}
              />
              <select
                className={styles.select}
                value={form.sellerState}
                onChange={(e) => update("sellerState", e.target.value)}
              >
                <option value="">Select state…</option>
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className={styles.uploadBox}>
              <div className={styles.uploadTitle}>Item photo</div>
              <p className={styles.uploadHint}>Upload a photo of the item — shown on the product page.</p>
              <input type="file" accept="image/*" onChange={handleImageFile} />
              {(imagePreview || form.imageUrl) && (
                <img
                  src={imagePreview || form.imageUrl}
                  alt="Item preview"
                  className={styles.uploadPreview}
                />
              )}
              <input
                className={styles.searchInput}
                style={{ marginTop: 8 }}
                placeholder="…or paste an image URL instead"
                value={imagePreview ? "" : form.imageUrl}
                disabled={!!imagePreview}
                onChange={(e) => update("imageUrl", e.target.value)}
              />
            </div>

            <div className={styles.uploadBox}>
              <div className={styles.uploadTitle}>Payment QR code</div>
              <p className={styles.uploadHint}>Buyers scan this to pay you directly (UPI / GPay / PhonePe).</p>
              <input type="file" accept="image/*" onChange={handleQrFile} />
              {(qrPreview || (form.sellerQrImageUrl && !qrPreview)) && (
                <img
                  src={qrPreview || form.sellerQrImageUrl}
                  alt="QR preview"
                  className={styles.uploadPreviewQr}
                />
              )}
              <input
                className={styles.searchInput}
                style={{ marginTop: 8 }}
                placeholder="…or paste a QR image URL instead"
                value={qrPreview ? "" : form.sellerQrImageUrl}
                disabled={!!qrPreview}
                onChange={(e) => update("sellerQrImageUrl", e.target.value)}
              />
              <input
                className={styles.searchInput}
                style={{ marginTop: 8 }}
                placeholder="UPI ID (optional, e.g. name@upi)"
                value={form.sellerUpiId}
                onChange={(e) => update("sellerUpiId", e.target.value)}
              />
            </div>

            <button className={styles.addBtn} type="submit" disabled={isSubmitting} style={{ padding: "12px" }}>
              {isSubmitting ? "Adding..." : "Add Product"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}

export default AddProduct;
