// frontend/src/utils/validation.js

/**
 * Validates password strength according to requirements:
 * - At least 8 characters
 * - At least 1 special character
 * - At least 1 number
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 */
export function validatePassword(password) {
  const errors = [];
  
  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least 1 special character');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least 1 number');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least 1 uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least 1 lowercase letter');
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

/**
 * Validates email format
 */
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Password strength indicator
 */
export function getPasswordStrength(password) {
  if (!password) return { strength: 0, label: '' };
  
  let strength = 0;
  const checks = [
    password.length >= 8,
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    /\d/.test(password),
    /[A-Z]/.test(password),
    /[a-z]/.test(password)
  ];
  
  strength = checks.filter(Boolean).length;
  
  const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['#dc2626', '#ea580c', '#d97706', '#059669', '#16a34a'];
  
  return {
    strength: strength,
    label: labels[strength - 1] || '',
    color: colors[strength - 1] || '#6b7280',
    percentage: (strength / 5) * 100
  };
}
