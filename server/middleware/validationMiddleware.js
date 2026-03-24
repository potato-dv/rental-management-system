// Validation middleware for input sanitization and validation

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

  next();
};

const validateLease = (req, res, next) => {
  const { tenantId, unitId, startDate, endDate, monthlyRent } = req.body;

  if (!tenantId || !tenantId.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      success: false,
      message: "Valid tenant ID is required",
    });
  }

  if (!unitId || !unitId.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      success: false,
      message: "Valid unit ID is required",
    });
  }

  if (!startDate || !endDate) {
    return res.status(400).json({
      success: false,
      message: "Start date and end date are required",
    });
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (end <= start) {
    return res.status(400).json({
      success: false,
      message: "End date must be after start date",
    });
  }

  if (!monthlyRent || monthlyRent <= 0) {
    return res.status(400).json({
      success: false,
      message: "Valid monthly rent amount is required",
    });
  }

  next();
};

const validatePayment = (req, res, next) => {
  const { leaseId, amount, paymentMethod, dueDate } = req.body;

  if (!leaseId || !leaseId.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      success: false,
      message: "Valid lease ID is required",
    });
  }

  if (!amount || amount <= 0) {
    return res.status(400).json({
      success: false,
      message: "Valid payment amount is required",
    });
  }

  const validMethods = ["cash", "gcash", "bank transfer", "maya"];
  if (!paymentMethod || !validMethods.includes(paymentMethod)) {
    return res.status(400).json({
      success: false,
      message:
        "Valid payment method is required (cash, gcash, bank transfer, maya)",
    });
  }

  if (!dueDate) {
    return res.status(400).json({
      success: false,
      message: "Due date is required",
    });
  }

  next();
};

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

  next();
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
  validateApplication,
  validateLease,
  validatePayment,
  validateMaintenanceRequest,
  validateObjectId,
};
