import rateLimit from 'express-rate-limit';

// Global API rate limiter: 150 requests per 15 minutes
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150,
  message: {
    error: 'Too many requests from this client. Please wait 15 minutes and retry.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Stricter auth rate limiter: 15 requests per 15 minutes
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  message: {
    error: 'Too many authentication attempts. Please wait 15 minutes and retry.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
