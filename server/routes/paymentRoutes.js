const express = require("express");
const router = express.Router();
const {
  getPayments,
  getPayment,
  getMyPayments,
  createPayment,
  recordTenantPayment,
  verifyPayment,
  updatePayment,
  deletePayment,
} = require("../controllers/paymentController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const {
  validatePayment,
  validateObjectId,
} = require("../middleware/validation");

// Tenant routes
router.get("/my/payments", protect, authorize("tenant"), getMyPayments);
router.post(
  "/:id/record",
  protect,
  authorize("tenant"),
  validateObjectId,
  recordTenantPayment,
);

// Admin routes
router.get("/", protect, authorize("admin"), getPayments);
router.post("/", protect, authorize("admin"), validatePayment, createPayment);
router.put(
  "/:id/verify",
  protect,
  authorize("admin"),
  validateObjectId,
  verifyPayment,
);
router.put(
  "/:id",
  protect,
  authorize("admin"),
  validateObjectId,
  updatePayment,
);
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  validateObjectId,
  deletePayment,
);

// Shared routes
router.get(
  "/:id",
  protect,
  authorize("admin", "tenant"),
  validateObjectId,
  getPayment,
);

module.exports = router;
