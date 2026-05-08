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
} = require("../middleware/validation");

// User/Tenant routes - get own applications, create application
// BAGO: Dinagdag ang "user" para makapag-apply ang mga bagong gawang account!
router.get(
  "/my/applications",
  protect,
  authorize("tenant", "user"), 
  getMyApplications
);

router.post(
  "/",
  protect,
  authorize("tenant", "user"), // BAGO: Allowed na ang normal na "user" mag-apply
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
  authorize("admin", "tenant", "user"), // BAGO: Dinagdag ang "user"
  validateObjectId,
  getApplication,
);

router.delete(
  "/:id",
  protect,
  authorize("admin", "tenant", "user"), // BAGO: Dinagdag ang "user"
  validateObjectId,
  deleteApplication,
);

module.exports = router;