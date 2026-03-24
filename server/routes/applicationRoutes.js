const express = require("express");
const router = express.Router();
const {
  getApplications,
  getApplication,
  getMyApplications,
  createApplication,
  updateApplicationStatus,
  deleteApplication,
} = require("../controllers/applicationController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const {
  validateApplication,
  validateObjectId,
} = require("../middleware/validationMiddleware");

// Tenant routes - get own applications, create application
router.get("/my/applications", protect, authorize("tenant"), getMyApplications);
router.post(
  "/",
  protect,
  authorize("tenant"),
  validateApplication,
  createApplication,
);

// Admin routes - view all applications, update status
router.get("/", protect, authorize("admin"), getApplications);
router.put(
  "/:id/status",
  protect,
  authorize("admin"),
  validateObjectId,
  updateApplicationStatus,
);

// Shared routes - view single application (with permission check), delete
router.get(
  "/:id",
  protect,
  authorize("admin", "tenant"),
  validateObjectId,
  getApplication,
);
router.delete(
  "/:id",
  protect,
  authorize("admin", "tenant"),
  validateObjectId,
  deleteApplication,
);

module.exports = router;
