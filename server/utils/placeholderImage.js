// Products can have a real photo (imageUrl), but for demo/seed data or
// when a user doesn't have one handy, this generates a placeholder that
// at least matches the app's theme instead of a generic broken-image icon.
// placehold.co renders these on the fly - no hosting, no copyright risk,
// no broken links.

export function placeholderImageUrl(productName) {
  const label = encodeURIComponent(productName.slice(0, 24));
  return `https://placehold.co/400x400/0f1729/4d9fff?text=${label}&font=source-sans-pro`;
}
