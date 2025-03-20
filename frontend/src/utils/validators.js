/**
 * Utility functions for form validation
 */

export const isNotEmpty = (value) => {
    return value !== undefined && value !== null && value !== '';
  };
  
  export const isInRange = (value, min, max) => {
    const numValue = Number(value);
    return numValue >= min && numValue <= max;
  };
  
  export const isValidDate = (value) => {
    const date = new Date(value);
    return !isNaN(date.getTime());
  };
  
  export const isFutureDate = (value) => {
    const date = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return !isNaN(date.getTime()) && date >= today;
  };
  
  export const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };
  
  export const validatePhoneNumber = (phone) => {
    const re = /^\+?[0-9]{10,15}$/;
    return re.test(String(phone).replace(/\s+/g, ''));
  };