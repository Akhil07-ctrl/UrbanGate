import jwt from 'jsonwebtoken';

import config from '../config/config.js';

export const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    console.log('Decoded token:', decoded);  // Add this line
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    console.log('User role:', req.user?.role); // Add this
    console.log('Allowed roles:', allowedRoles); // Add this
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    if (allowedRoles.includes(req.user.role)) {
      next();
    } else {
      return res.status(403).json({
        message: 'Access denied',
        userRole: req.user.role,  // Add this
        allowedRoles              // Add this
      });
    }
  };
};
