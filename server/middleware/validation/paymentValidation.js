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

module.exports = {
  validatePayment,
};
