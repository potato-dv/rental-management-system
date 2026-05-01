const express = require("express");
const router = express.Router();
const {
  getUnits,
  getUnit,
  updateUnit,
  createUnit,
  deleteUnit,
} = require("../controllers/unitController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const {
  validateUnit,
  validateCreateUnit,
  validateObjectId,
} = require("../middleware/validation");

// Public routes - Anyone can view units
router.get("/", getUnits);
router.get("/:id", validateObjectId, getUnit);

// Admin routes
router.post("/", protect, authorize("admin"), validateCreateUnit, createUnit);
router.put(
  "/:id",
  protect,
  authorize("admin"),
  validateObjectId,
  validateUnit,
  updateUnit,
);
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  validateObjectId,
  deleteUnit,
);

module.exports = router;
