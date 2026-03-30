const { sanitizeString } = require("./helpers");

const validateUnit = (req, res, next) => {
  const { type, price, status, description } = req.body;

  // Type validation (if provided)
  if (type) {
    const validTypes = [
      "studio",
      "one-bedroom",
      "two-bedroom",
      "three-bedroom",
    ];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message:
          "Type must be one of: studio, one-bedroom, two-bedroom, three-bedroom",
      });
    }
  }

  // Price validation (if provided)
  if (price !== undefined) {
    if (typeof price !== "number" || price <= 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be a positive number",
      });
    }
    if (price > 1000000) {
      return res.status(400).json({
        success: false,
        message: "Price cannot exceed 1,000,000",
      });
    }
  }

  // Status validation (if provided)
  if (status) {
    const validStatuses = ["available", "occupied"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be either 'available' or 'occupied'",
      });
    }
  }

  // Description validation (if provided)
  if (description && description.length > 1000) {
    return res.status(400).json({
      success: false,
      message: "Description cannot exceed 1000 characters",
    });
  }

  // Sanitize description
  if (description) {
    req.body.description = sanitizeString(description);
  }

  next();
};

module.exports = {
  validateUnit,
};
