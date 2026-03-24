const express = require("express");
const router = express.Router();
const {
  getLeases,
  getLease,
  getMyLease,
  createLease,
  updateLease,
  terminateLease,
} = require("../controllers/leaseController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const {
  validateLease,
  validateObjectId,
} = require("../middleware/validationMiddleware");

// Tenant routes
router.get("/my/lease", protect, authorize("tenant"), getMyLease);

// Admin routes
router.get("/", protect, authorize("admin"), getLeases);
router.post("/", protect, authorize("admin"), validateLease, createLease);
router.put("/:id", protect, authorize("admin"), validateObjectId, updateLease);
router.put(
  "/:id/terminate",
  protect,
  authorize("admin"),
  validateObjectId,
  terminateLease,
);

// Shared routes
router.get(
  "/:id",
  protect,
  authorize("admin", "tenant"),
  validateObjectId,
  getLease,
);

module.exports = router;
