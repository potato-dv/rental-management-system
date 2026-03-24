const express = require("express");
const router = express.Router();
const {
  getTenants,
  getTenant,
  getMyProfile,
  updateTenant,
  updateMyProfile,
  deleteTenant,
} = require("../controllers/tenantController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const { validateObjectId } = require("../middleware/validationMiddleware");

// Tenant's own profile routes
router.get("/profile/me", protect, authorize("tenant"), getMyProfile);
router.put("/profile/me", protect, authorize("tenant"), updateMyProfile);

// Admin routes for managing tenants
router.get("/", protect, authorize("admin"), getTenants);
router.get("/:id", protect, authorize("admin"), validateObjectId, getTenant);
router.put("/:id", protect, authorize("admin"), validateObjectId, updateTenant);
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  validateObjectId,
  deleteTenant,
);

module.exports = router;
