// Wraps an async controller so any thrown/rejected error is forwarded to
// next(err) automatically, instead of every controller needing its own
// try/catch. Pairs with middleware/errorHandler.js.

export function asyncHandler(fn) {
  return function wrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
