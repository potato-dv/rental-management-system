const { sanitizeString } = require("./helpers");

const validateApplication = (req, res, next) => {
  const { unitId, moveInDate, moveOutDate, message } = req.body;

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

  if (!moveOutDate) {
    return res.status(400).json({
      success: false,
      message: "Move-out date is required",
    });
  }

  const moveIn = new Date(moveInDate);
  const moveOut = new Date(moveOutDate);
  if (Number.isNaN(moveIn.getTime()) || Number.isNaN(moveOut.getTime())) {
    return res.status(400).json({
      success: false,
      message: "Invalid move-in or move-out date",
    });
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  moveIn.setHours(0, 0, 0, 0);
  moveOut.setHours(0, 0, 0, 0);

  if (moveIn < today) {
    return res.status(400).json({
      success: false,
      message: "Move-in date cannot be in the past",
    });
  }

  if (moveOut <= moveIn) {
    return res.status(400).json({
      success: false,
      message: "Move-out date must be after move-in date",
    });
  }

  const minMoveOut = new Date(moveIn);
  minMoveOut.setMonth(minMoveOut.getMonth() + 1);
  if (moveOut < minMoveOut) {
    return res.status(400).json({
      success: false,
      message: "Move-out date must be at least 1 month after move-in date",
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
