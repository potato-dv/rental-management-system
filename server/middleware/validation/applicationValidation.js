const { sanitizeString } = require("./helpers");

const validateApplication = (req, res, next) => {
  const { unitId, moveInDate, message } = req.body;

  if (!unitId || !unitId.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      success: false,
      message: "Valid unit ID is required",
    });
  }

  if (!moveInDate) {
    return res.status(400).json({
      success: false,
      message: "Move-in date is required",
    });
  }

  const moveIn = new Date(moveInDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (moveIn < today) {
    return res.status(400).json({
      success: false,
      message: "Move-in date cannot be in the past",
    });
  }

  if (message && message.length > 500) {
    return res.status(400).json({
      success: false,
      message: "Message cannot exceed 500 characters",
    });
  }

  // Sanitize message
  if (message) {
    req.body.message = sanitizeString(message);
  }

  next();
};

module.exports = {
  validateApplication,
};
