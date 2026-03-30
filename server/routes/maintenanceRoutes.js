const express = require("express");
const router = express.Router();
const {
  getMaintenanceRequests,
  getMaintenanceRequest,
  getMyMaintenanceRequests,
  createMaintenanceRequest,
  updateMaintenanceStatus,
  updateMaintenancePriority,
  deleteMaintenanceRequest,
} = require("../controllers/maintenanceController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const {
  validateMaintenanceRequest,
  validateObjectId,
} = require("../middleware/validation");

// Tenant routes
router.get(
  "/my/requests",
  protect,
  authorize("tenant"),
  getMyMaintenanceRequests,
);
router.post(
  "/",
  protect,
  authorize("tenant"),
  validateMaintenanceRequest,
  createMaintenanceRequest,
);

// Admin routes
router.get("/", protect, authorize("admin"), getMaintenanceRequests);
router.put(
  "/:id/status",
  protect,
  authorize("admin"),
  validateObjectId,
  updateMaintenanceStatus,
);
router.put(
  "/:id/priority",
  protect,
  authorize("admin"),
  validateObjectId,
  updateMaintenancePriority,
);
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  validateObjectId,
  deleteMaintenanceRequest,
);

// Shared routes
router.get(
  "/:id",
  protect,
  authorize("admin", "tenant"),
  validateObjectId,
  getMaintenanceRequest,
);

module.exports = router;
