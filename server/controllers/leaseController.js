const Lease = require("../models/Lease");
const Unit = require("../models/Unit");
const User = require("../models/User");
const Payment = require("../models/Payment");

// @desc    Get all leases
// @route   GET /api/leases
// @access  Private/Admin
const getLeases = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};

    if (status) {
      filter.status = status;
    }

    const leases = await Lease.find(filter)
      .populate("tenantId", "name email contactNumber")
      .populate("unitId", "unitNumber type floor")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: leases.length,
      leases,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single lease
// @route   GET /api/leases/:id
// @access  Private
const getLease = async (req, res) => {
  try {
    const lease = await Lease.findById(req.params.id)
      .populate("tenantId", "name email contactNumber address")
      .populate("unitId", "unitNumber type floor price status");

    if (!lease) {
      return res.status(404).json({
        success: false,
        message: "Lease not found",
      });
    }

    // Tenants can only view their own leases
    if (
      req.user.role === "tenant" &&
      lease.tenantId._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this lease",
      });
    }

    // Get payments for this lease
    const payments = await Payment.find({ leaseId: lease._id }).sort({
      dueDate: -1,
    });

    res.status(200).json({
      success: true,
      lease,
      payments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get tenant's own lease
// @route   GET /api/leases/my/lease
// @access  Private/Tenant
const getMyLease = async (req, res) => {
  try {
    const lease = await Lease.findOne({
      tenantId: req.user.id,
      status: "active",
    })
      .populate("tenantId", "name email contactNumber")
      .populate("unitId", "unitNumber type floor price status");

    if (!lease) {
      return res.status(404).json({
        success: false,
        message: "No active lease found",
      });
    }

    // Get payments for this lease
    const payments = await Payment.find({ leaseId: lease._id }).sort({
      dueDate: -1,
    });

    res.status(200).json({
      success: true,
      lease,
      payments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create lease
// @route   POST /api/leases
// @access  Private/Admin
const createLease = async (req, res) => {
  try {
    const { tenantId, unitId, startDate, endDate, monthlyRent } = req.body;

    // Check if tenant exists
    const tenant = await User.findOne({ _id: tenantId, role: "tenant" });
    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: "Tenant not found",
      });
    }

    // Check if tenant already has an active lease
    const existingLease = await Lease.findOne({
      tenantId,
      status: "active",
    });

    if (existingLease) {
      return res.status(400).json({
        success: false,
        message: "Tenant already has an active lease",
      });
    }

    // Check if unit exists and is available
    const unit = await Unit.findById(unitId);
    if (!unit) {
      return res.status(404).json({
        success: false,
        message: "Unit not found",
      });
    }

    if (unit.status !== "available") {
      return res.status(400).json({
        success: false,
        message: "Unit is not available",
      });
    }

    // Create lease
    const lease = await Lease.create({
      tenantId,
      unitId,
      startDate,
      endDate,
      monthlyRent,
    });

    // Update unit status to occupied
    await Unit.findByIdAndUpdate(unitId, { status: "occupied" });

    const populatedLease = await Lease.findById(lease._id)
      .populate("tenantId", "name email contactNumber")
      .populate("unitId", "unitNumber type floor");

    // Create initial payment records for the lease duration
    const start = new Date(startDate);
    const end = new Date(endDate);
    const payments = [];

    let currentDate = new Date(start);
    while (currentDate <= end) {
      payments.push({
        leaseId: lease._id,
        tenantId,
        amount: monthlyRent,
        dueDate: new Date(currentDate),
        paymentMethod: "gcash",
        recordedBy: "admin",
        status: "pending",
        remainingBalance: monthlyRent,
      });

      // Move to next month
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    await Payment.insertMany(payments);

    res.status(201).json({
      success: true,
      message: "Lease created successfully",
      lease: populatedLease,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update lease
// @route   PUT /api/leases/:id
// @access  Private/Admin
const updateLease = async (req, res) => {
  try {
    const { monthlyRent, endDate } = req.body;

    const lease = await Lease.findById(req.params.id);

    if (!lease) {
      return res.status(404).json({
        success: false,
        message: "Lease not found",
      });
    }

    // Only allow updating certain fields
    const updateData = {};
    if (monthlyRent) updateData.monthlyRent = monthlyRent;
    if (endDate) {
      const newEndDate = new Date(endDate);
      if (newEndDate <= lease.startDate) {
        return res.status(400).json({
          success: false,
          message: "End date must be after start date",
        });
      }
      updateData.endDate = endDate;
    }

    const updatedLease = await Lease.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true },
    )
      .populate("tenantId", "name email contactNumber")
      .populate("unitId", "unitNumber type floor");

    res.status(200).json({
      success: true,
      message: "Lease updated successfully",
      lease: updatedLease,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Terminate lease
// @route   PUT /api/leases/:id/terminate
// @access  Private/Admin
const terminateLease = async (req, res) => {
  try {
    const lease = await Lease.findById(req.params.id);

    if (!lease) {
      return res.status(404).json({
        success: false,
        message: "Lease not found",
      });
    }

    if (lease.status === "terminated") {
      return res.status(400).json({
        success: false,
        message: "Lease is already terminated",
      });
    }

    // Check for unpaid payments
    const unpaidPayments = await Payment.find({
      leaseId: lease._id,
      status: "pending",
    });

    if (unpaidPayments.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot terminate lease with unpaid payments",
      });
    }

    // Terminate lease
    lease.status = "terminated";
    await lease.save();

    // Update unit status to available
    await Unit.findByIdAndUpdate(lease.unitId, { status: "available" });

    const updatedLease = await Lease.findById(lease._id)
      .populate("tenantId", "name email contactNumber")
      .populate("unitId", "unitNumber type floor");

    res.status(200).json({
      success: true,
      message: "Lease terminated successfully",
      lease: updatedLease,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getLeases,
  getLease,
  getMyLease,
  createLease,
  updateLease,
  terminateLease,
};
