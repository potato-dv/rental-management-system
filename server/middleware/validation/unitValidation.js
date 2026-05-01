const { sanitizeString } = require("./helpers");

const validateUnit = (req, res, next) => {
  const { unitNumber, type, price, status, description, floor } = req.body;

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

  // Unit number validation (if provided)
  if (unitNumber !== undefined) {
    if (typeof unitNumber !== "string" || !unitNumber.trim()) {
      return res.status(400).json({
        success: false,
        message: "Unit number must be a non-empty string",
      });
    }
    if (unitNumber.trim().length > 20) {
      return res.status(400).json({
        success: false,
        message: "Unit number cannot exceed 20 characters",
      });
    }
  }

  // Floor validation (if provided)
  if (floor !== undefined) {
    if (typeof floor !== "string" || !floor.trim()) {
      return res.status(400).json({
        success: false,
        message: "Floor must be a non-empty string",
      });
    }
    if (floor.trim().length > 10) {
      return res.status(400).json({
        success: false,
        message: "Floor cannot exceed 10 characters",
      });
    }
  }

  // Sanitize description
  if (description) {
    req.body.description = sanitizeString(description);
  }
  if (unitNumber) {
    req.body.unitNumber = sanitizeString(unitNumber);
  }
  if (floor) {
    req.body.floor = sanitizeString(floor);
  }

  next();
};

const validateCreateUnit = (req, res, next) => {
  const { unitNumber, type, price } = req.body;

  if (unitNumber === undefined || unitNumber === null || unitNumber === "") {
    return res.status(400).json({
      success: false,
      message: "Unit number is required",
    });
  }

  if (!type) {
    return res.status(400).json({
      success: false,
      message: "Type is required",
    });
  }

  if (price === undefined || price === null) {
    return res.status(400).json({
      success: false,
      message: "Price is required",
    });
  }

  return validateUnit(req, res, next);
};

module.exports = {
  validateUnit,
  validateCreateUnit,
};
