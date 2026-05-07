const { sanitizeString } = require("./helpers");

const validateHelpReport = (req, res, next) => {
  const { category, subject, description } = req.body;

  if (!category || !["help", "report"].includes(category)) {
    return res.status(400).json({
      success: false,
      message: "Category must be either help or report",
    });
  }

  if (!subject || subject.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: "Subject is required",
    });
  }

  if (subject.length > 100) {
    return res.status(400).json({
      success: false,
      message: "Subject cannot exceed 100 characters",
    });
  }

  if (!description || description.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: "Description is required",
    });
  }

  if (description.length > 2000) {
    return res.status(400).json({
      success: false,
      message: "Description cannot exceed 2000 characters",
    });
  }

  req.body.subject = sanitizeString(subject);
  req.body.description = sanitizeString(description);

  next();
};

const validateHelpReportStatusUpdate = (req, res, next) => {
  const { status, adminResponse } = req.body;

  if (!status || !["open", "in-progress", "resolved"].includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Status must be open, in-progress, or resolved",
    });
  }

  if (typeof adminResponse !== "undefined") {
    if (typeof adminResponse !== "string") {
      return res.status(400).json({
        success: false,
        message: "adminResponse must be a string",
      });
    }

    if (adminResponse.length > 2000) {
      return res.status(400).json({
        success: false,
        message: "adminResponse cannot exceed 2000 characters",
      });
    }

    req.body.adminResponse = sanitizeString(adminResponse);
  }

  next();
};

module.exports = {
  validateHelpReport,
  validateHelpReportStatusUpdate,
};
