// Shared validation helpers and utilities

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const sanitizeString = (str) => {
  if (typeof str !== "string") return str;
  return str.replace(/[<>]/g, "").trim();
};

const validateObjectId = (req, res, next) => {
  const { id } = req.params;

  if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      success: false,
      message: "Invalid ID format",
    });
  }

  next();
};

module.exports = {
  emailRegex,
  sanitizeString,
  validateObjectId,
};
