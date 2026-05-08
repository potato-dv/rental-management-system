const express = require("express");
const router = express.Router();
const {
  getReports,
  createReport,
  updateReportStatus,
  deleteReport,
} = require("../controllers/reportController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

// GET all reports (Admin & Tenant) & POST new report (Tenant)
router.route("/")
  .get(protect, getReports)
  .post(protect, authorize("tenant"), createReport);

// PUT status update & DELETE (Admin only)
router.route("/:id/status")
  .put(protect, authorize("admin"), updateReportStatus);

router.route("/:id")
  .delete(protect, authorize("admin"), deleteReport);

module.exports = router;