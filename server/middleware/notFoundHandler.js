// Catches any request that didn't match a route above it.
// Must be registered after all feature routes, before errorHandler.

export function notFoundHandler(req, res, next) {
  res.status(404).json({
    error: {
      message: `Route not found: ${req.method} ${req.originalUrl}`,
    },
  });
}
