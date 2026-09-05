// UPI (India's Unified Payments Interface) apps recognize a standard
// deep-link format: upi://pay?pa=<payee address>&pn=<name>&am=<amount>&cu=INR
// Encoding that string as a QR code is genuinely how real UPI QR codes
// work - scanning it with GPay/PhonePe/Paytm opens a pre-filled payment
// screen. We don't generate the QR image ourselves; api.qrserver.com is
// a free public service that renders any text as a QR code image.

export function buildUpiQrUrl({ upiId, payeeName, amount }) {
  const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
    payeeName || "Seller"
  )}&am=${encodeURIComponent(amount.toFixed(2))}&cu=INR`;

  return `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(upiUri)}`;
}
