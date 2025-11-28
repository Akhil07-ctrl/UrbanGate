import { sanitizeObject, validateEmail, validatePhone } from '../utils/validation.js';

// Middleware to sanitize request body
export const sanitizeBody = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  next();
};

// Middleware to validate email
export const validateEmailMiddleware = (req, res, next) => {
  const { email } = req.body;
  if (email && !validateEmail(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }
  next();
};

// Middleware to validate phone
export const validatePhoneMiddleware = (req, res, next) => {
  const { phone } = req.body;
  if (phone && !validatePhone(phone)) {
    return res.status(400).json({ message: 'Invalid phone number format' });
  }
  next();
};

