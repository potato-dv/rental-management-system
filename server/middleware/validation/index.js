// Export all validators from one place

const { validateRegister, validateLogin } = require("./authValidation");
const { validateUnit, validateCreateUnit } = require("./unitValidation");
const { validateTenantUpdate } = require("./tenantValidation");
const { validateApplication } = require("./applicationValidation");
const { validateLease } = require("./leaseValidation");
const { validatePayment } = require("./paymentValidation");
const { validateMaintenanceRequest } = require("./maintenanceValidation");
const {
  validateHelpReport,
  validateHelpReportStatusUpdate,
} = require("./helpReportValidation");
const { validateObjectId, isValidObjectId } = require("./helpers");

module.exports = {
  validateRegister,
  validateLogin,
  validateUnit,
  validateCreateUnit,
  validateTenantUpdate,
  validateApplication,
  validateLease,
  validatePayment,
  validateMaintenanceRequest,
  validateHelpReport,
  validateHelpReportStatusUpdate,
  validateObjectId,
  isValidObjectId,
};
