import jwt from 'jsonwebtoken';
import config from '../config/config.js';

export const generateToken = (userId, role, email) => {
  return jwt.sign(
    { userId, role, email },
    config.jwtSecret,
    { expiresIn: config.jwtExpire }
  );
};

export const generateQRCode = async (data) => {
  try {
    const QRCode = (await import('qrcode')).default;
    return await QRCode.toDataURL(data);
  } catch (error) {
    console.error('QR Code generation error:', error);
    throw error;
  }
};
