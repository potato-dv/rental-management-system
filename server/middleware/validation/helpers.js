// Shared validation helpers and utilities

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const sanitizeString = (str) => {
  if (typeof str !== "string") return str;
  return str.replace(/[<>]/g, "").trim();
};

const isValidObjectId = (value) => {
  return typeof value === "string" && value.match(/^[0-9a-fA-F]{24}$/);
};

const validateObjectId = (req, res, next) => {
  const { id } = req.params;

  if (!id || !isValidObjectId(id)) {
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
  isValidObjectId,
};
