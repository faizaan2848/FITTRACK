// Single source of truth for money display: Indian rupees.
// Prices are stored as plain numbers (INR) on the Product/Order rows.

export function formatINR(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: Number.isInteger(num) ? 0 : 2,
  }).format(num);
}
