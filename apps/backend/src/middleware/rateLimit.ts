import rateLimit from 'express-rate-limit';

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: 'TooManyRequests', message: 'Too many auth attempts. Try again later.' }
});

export const adminLoginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'TooManyRequests', message: 'Too many admin login attempts. Try again later.' }
});
