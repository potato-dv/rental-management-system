const { emailRegex, sanitizeString } = require("./helpers");

const validateTenantUpdate = (req, res, next) => {
  const { name, email, contactNumber, address } = req.body;

  // Name validation (if provided)
  if (name !== undefined) {
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Name cannot be empty",
      });
    }
    if (name.length < 2 || name.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Name must be between 2 and 100 characters",
      });
    }
    req.body.name = sanitizeString(name);
  }

  // Email validation (if provided)
  if (email !== undefined) {
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Valid email address is required",
      });
    }
    req.body.email = email.toLowerCase().trim();
  }

  // Contact number validation (if provided)
  if (contactNumber !== undefined && contactNumber.length > 0) {
    if (contactNumber.length < 7 || contactNumber.length > 20) {
      return res.status(400).json({
        success: false,
        message: "Contact number must be between 7 and 20 characters",
      });
    }
  }

  // Address validation (if provided)
  if (address !== undefined && address.length > 500) {
    return res.status(400).json({
      success: false,
      message: "Address cannot exceed 500 characters",
    });
  }

  // Sanitize address
  if (address) {
    req.body.address = sanitizeString(address);
  }

  next();
};

module.exports = {
  validateTenantUpdate,
};
