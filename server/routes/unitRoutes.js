const express = require("express");
const router = express.Router();
const {
  getUnits,
  getUnit,
  updateUnit,
} = require("../controllers/unitController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const { validateUnit, validateObjectId } = require("../middleware/validation");

// Public routes - Anyone can view units
router.get("/", getUnits);
router.get("/:id", validateObjectId, getUnit);

// Admin routes - Only admins can update unit details (price, status, description, images)
router.put(
  "/:id",
  protect,
  authorize("admin"),
  validateObjectId,
  validateUnit,
  updateUnit,
);

// Note: CREATE and DELETE routes are removed because units are fixed
// Units should be initialized using: node server/scripts/initUnits.js

module.exports = router;
