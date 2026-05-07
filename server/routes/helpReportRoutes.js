const express = require("express");
const router = express.Router();
const {
  getHelpReports,
  getHelpReport,
  getMyHelpReports,
  createHelpReport,
  updateHelpReportStatus,
  deleteHelpReport,
} = require("../controllers/helpReportController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const {
  validateHelpReport,
  validateHelpReportStatusUpdate,
  validateObjectId,
} = require("../middleware/validation");

// Tenant routes
router.get("/my/requests", protect, authorize("tenant"), getMyHelpReports);
router.post(
  "/",
  protect,
  authorize("tenant"),
  validateHelpReport,
  createHelpReport,
);

// Admin routes
router.get("/", protect, authorize("admin"), getHelpReports);
router.put(
  "/:id/status",
  protect,
  authorize("admin"),
  validateObjectId,
  validateHelpReportStatusUpdate,
  updateHelpReportStatus,
);
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  validateObjectId,
  deleteHelpReport,
);

// Shared routes
router.get(
  "/:id",
  protect,
  authorize("admin", "tenant"),
  validateObjectId,
  getHelpReport,
);

module.exports = router;
