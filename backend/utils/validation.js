// Input validation and sanitization utilities

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  // Remove potentially dangerous characters
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone) => {
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

export const validateDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return start < end && start >= new Date();
};

export const validateTimeSlot = (startTime, endTime, existingSlots) => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  
  if (start >= end) {
    return { valid: false, message: 'End time must be after start time' };
  }
  
  if (start < new Date()) {
    return { valid: false, message: 'Cannot book in the past' };
  }
  
  // Check for conflicts
  const hasConflict = existingSlots.some(slot => {
    const slotStart = new Date(slot.startTime);
    const slotEnd = new Date(slot.endTime);
    
    return (
      (start >= slotStart && start < slotEnd) ||
      (end > slotStart && end <= slotEnd) ||
      (start <= slotStart && end >= slotEnd)
    );
  });
  
  if (hasConflict) {
    return { valid: false, message: 'Time slot conflicts with existing booking' };
  }
  
  return { valid: true };
};

export const validateAmount = (amount) => {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0 && num <= 1000000; // Max 1 million
};

export const sanitizeObject = (obj) => {
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitizeInput(item) : item
      );
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

