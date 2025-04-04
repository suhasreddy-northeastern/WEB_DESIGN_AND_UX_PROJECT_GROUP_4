// middleware/validateRequest.js
const validateUserCreation = (req, res, next) => {
    const { fullName, email, password } = req.body;
    const errors = [];
  
    // Validate fullName - only alphabetic characters
    if (!fullName || !/^[a-zA-Z\s]+$/.test(fullName)) {
      errors.push('Full name must contain only alphabetic characters');
    }
  
    // Validate email format
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!email || !emailRegex.test(email)) {
      errors.push('Valid email address is required');
    }
  
    // Validate password strength
    // At least 8 characters, one uppercase, one lowercase, one digit, one special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!password || !passwordRegex.test(password)) {
      errors.push('Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one digit, and one special character');
    }
  
    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed.', details: errors });
    }
  
    next();
  };
  
  const validateUserUpdate = (req, res, next) => {
    const { fullName, password } = req.body;
    const errors = [];
  
    // Validate fullName if provided
    if (fullName && !/^[a-zA-Z\s]+$/.test(fullName)) {
      errors.push('Full name must contain only alphabetic characters');
    }
  
    // Validate password if provided
    if (password) {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(password)) {
        errors.push('Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one digit, and one special character');
      }
    }
  
    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed.', details: errors });
    }
  
    next();
  };
  
  module.exports = {
    validateUserCreation,
    validateUserUpdate
  };