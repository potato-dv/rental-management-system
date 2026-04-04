// Export all validators from one place

const { validateRegister, validateLogin } = require("./authValidation");
const { validateUnit } = require("./unitValidation");
const { validateTenantUpdate } = require("./tenantValidation");
const { validateApplication } = require("./applicationValidation");
const { validateLease } = require("./leaseValidation");
const { validatePayment } = require("./paymentValidation");
const { validateMaintenanceRequest } = require("./maintenanceValidation");
const { validateObjectId, isValidObjectId } = require("./helpers");

module.exports = {
  validateRegister,
  validateLogin,
  validateUnit,
  validateTenantUpdate,
  validateApplication,
  validateLease,
  validatePayment,
  validateMaintenanceRequest,
  validateObjectId,
  isValidObjectId,
};
