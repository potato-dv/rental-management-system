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

  const minEnd = new Date(start);
  minEnd.setMonth(minEnd.getMonth() + 1);
  if (end < minEnd) {
    return res.status(400).json({
      success: false,
      message: "Lease end date must be at least 1 month after start date",
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

module.exports = {
  validateLease,
};
