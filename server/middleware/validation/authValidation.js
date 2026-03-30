const { emailRegex, sanitizeString } = require("./helpers");

const validateRegister = (req, res, next) => {
  const { name, email, password, contactNumber } = req.body;

  // Name validation
  if (!name || name.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: "Name is required",
    });
  }

  if (name.length < 2 || name.length > 100) {
    return res.status(400).json({
      success: false,
      message: "Name must be between 2 and 100 characters",
    });
  }

  // Email validation
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Valid email address is required",
    });
  }

  // Password validation
  if (!password || password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters long",
    });
  }

  if (password.length > 128) {
    return res.status(400).json({
      success: false,
      message: "Password cannot exceed 128 characters",
    });
  }

  // Contact number validation (optional but must be valid if provided)
  if (
    contactNumber &&
    (contactNumber.length < 7 || contactNumber.length > 20)
  ) {
    return res.status(400).json({
      success: false,
      message: "Contact number must be between 7 and 20 characters",
    });
  }

  // Sanitize inputs
  req.body.name = sanitizeString(name);
  req.body.email = email.toLowerCase().trim();
  if (req.body.address) {
    req.body.address = sanitizeString(req.body.address);
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Valid email address is required",
    });
  }

  if (!password || password.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: "Password is required",
    });
  }

  req.body.email = email.toLowerCase().trim();

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
};
