const { sanitizeString } = require("./helpers");

const validateMaintenanceRequest = (req, res, next) => {
  const { unitId, title, description, priority } = req.body;

  if (!unitId || !unitId.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      success: false,
      message: "Valid unit ID is required",
    });
  }

  if (!title || title.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: "Title is required",
    });
  }

  if (title.length > 100) {
    return res.status(400).json({
      success: false,
      message: "Title cannot exceed 100 characters",
    });
  }

  if (!description || description.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: "Description is required",
    });
  }

  if (description.length > 1000) {
    return res.status(400).json({
      success: false,
      message: "Description cannot exceed 1000 characters",
    });
  }

  const validPriorities = ["low", "medium", "high"];
  if (priority && !validPriorities.includes(priority)) {
    return res.status(400).json({
      success: false,
      message: "Priority must be low, medium, or high",
    });
  }

  // Sanitize inputs
  req.body.title = sanitizeString(title);
  req.body.description = sanitizeString(description);

  next();
};

module.exports = {
  validateMaintenanceRequest,
};
