const Payment = require("../models/Payment");
const Lease = require("../models/Lease");
const { isValidObjectId } = require("../middleware/validation");
const { sendServerError } = require("../utils/errorResponse");
const { syncOverduePayments } = require("../utils/syncOverduePayments");

// @desc    Get all payments
// @route   GET /api/payments
// @access  Private/Admin
const getPayments = async (req, res) => {
  try {
    await syncOverduePayments();

    const { status, tenantId } = req.query;
    const filter = {};

    const validStatuses = ["pending", "verified", "overdue"];

    if (status) {
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status. Must be pending, verified, or overdue",
        });
      }
      filter.status = status;
    }

    if (tenantId) {
      if (!isValidObjectId(tenantId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid tenant ID format",
        });
      }
      filter.tenantId = tenantId;
    }

    const payments = await Payment.find(filter)
      .populate("tenantId", "name email contactNumber")
      .populate({
        path: "leaseId",
        populate: {
          path: "unitId",
          select: "unitNumber type floor",
        },
      })
      .sort({ dueDate: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    return sendServerError(res, error);
  }
};

// @desc    Get single payment
// @route   GET /api/payments/:id
// @access  Private
const getPayment = async (req, res) => {
  try {
    await syncOverduePayments();

    const payment = await Payment.findById(req.params.id)
      .populate("tenantId", "name email contactNumber")
      .populate({
        path: "leaseId",
        populate: {
          path: "unitId",
          select: "unitNumber type floor",
        },
      });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // Tenants can only view their own payments
    if (
      req.user.role === "tenant" &&
      payment.tenantId._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this payment",
      });
    }

    res.status(200).json({
      success: true,
      payment,
    });
  } catch (error) {
    return sendServerError(res, error);
  }
};

// @desc    Get tenant's own payments
// @route   GET /api/payments/my/payments
// @access  Private/Tenant
const getMyPayments = async (req, res) => {
  try {
    await syncOverduePayments();

    const payments = await Payment.find({ tenantId: req.user.id })
      .populate({
        path: "leaseId",
        populate: {
          path: "unitId",
          select: "unitNumber type floor",
        },
      })
      .sort({ dueDate: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    return sendServerError(res, error);
  }
};

// @desc    Create payment record
// @route   POST /api/payments
// @access  Private/Admin
const createPayment = async (req, res) => {
  try {
    const { leaseId, amount, dueDate, paymentMethod } = req.body;

    // Verify lease exists
    const lease = await Lease.findById(leaseId);
    if (!lease) {
      return res.status(404).json({
        success: false,
        message: "Lease not found",
      });
    }

    const payment = await Payment.create({
      leaseId,
      tenantId: lease.tenantId,
      amount,
      dueDate,
      paymentMethod,
      recordedBy: "admin",
      remainingBalance: amount,
    });

    const populatedPayment = await Payment.findById(payment._id)
      .populate("tenantId", "name email contactNumber")
      .populate({
        path: "leaseId",
        populate: {
          path: "unitId",
          select: "unitNumber type floor",
        },
      });

    res.status(201).json({
      success: true,
      message: "Payment record created successfully",
      payment: populatedPayment,
    });
  } catch (error) {
    return sendServerError(res, error);
  }
};

// @desc    Record tenant payment
// @route   POST /api/payments/:id/record
// @access  Private/Tenant
const recordTenantPayment = async (req, res) => {
  try {
    const { paymentMethod } = req.body;

    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // Verify tenant owns this payment
    if (payment.tenantId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to record this payment",
      });
    }

    if (payment.status === "verified") {
      return res.status(400).json({
        success: false,
        message: "Payment already verified",
      });
    }

    // Validate file upload
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Proof of payment file is required",
      });
    }

    payment.paidDate = Date.now();
    payment.paymentMethod = paymentMethod;
    payment.proofOfPayment = req.file.path;
    payment.recordedBy = "tenant";
    payment.status = "pending";
    await payment.save();

    const updatedPayment = await Payment.findById(payment._id)
      .populate("tenantId", "name email contactNumber")
      .populate({
        path: "leaseId",
        populate: {
          path: "unitId",
          select: "unitNumber type floor",
        },
      });

    res.status(200).json({
      success: true,
      message: "Payment recorded and pending verification",
      payment: updatedPayment,
    });
  } catch (error) {
    return sendServerError(res, error);
  }
};

// @desc    Verify payment
// @route   PUT /api/payments/:id/verify
// @access  Private/Admin
const verifyPayment = async (req, res) => {
  try {
    const { receiptPath } = req.body;

    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    if (payment.status === "verified") {
      return res.status(400).json({
        success: false,
        message: "Payment already verified",
      });
    }

    payment.status = "verified";
    payment.remainingBalance = 0;
    if (receiptPath) {
      payment.receiptPath = receiptPath;
    }

    await payment.save();

    const updatedPayment = await Payment.findById(payment._id)
      .populate("tenantId", "name email contactNumber")
      .populate({
        path: "leaseId",
        populate: {
          path: "unitId",
          select: "unitNumber type floor",
        },
      });

    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      payment: updatedPayment,
    });
  } catch (error) {
    return sendServerError(res, error);
  }
};

// @desc    Update payment
// @route   PUT /api/payments/:id
// @access  Private/Admin
const updatePayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate("tenantId", "name email contactNumber")
      .populate({
        path: "leaseId",
        populate: {
          path: "unitId",
          select: "unitNumber type floor",
        },
      });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Payment updated successfully",
      payment,
    });
  } catch (error) {
    return sendServerError(res, error);
  }
};

// @desc    Delete payment
// @route   DELETE /api/payments/:id
// @access  Private/Admin
const deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Payment deleted successfully",
    });
  } catch (error) {
    return sendServerError(res, error);
  }
};

module.exports = {
  getPayments,
  getPayment,
  getMyPayments,
  createPayment,
  recordTenantPayment,
  verifyPayment,
  updatePayment,
  deletePayment,
};
