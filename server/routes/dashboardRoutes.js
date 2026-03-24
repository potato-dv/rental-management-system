const express = require("express");
const router = express.Router();
const {
  getAdminDashboard,
  getTenantDashboard,
  getFinancialSummary,
} = require("../controllers/dashboardController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

// Admin dashboard routes
router.get("/admin", protect, authorize("admin"), getAdminDashboard);
router.get("/financial", protect, authorize("admin"), getFinancialSummary);

// Tenant dashboard routes
router.get("/tenant", protect, authorize("tenant"), getTenantDashboard);

module.exports = router;
