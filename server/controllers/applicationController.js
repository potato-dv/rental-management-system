const RentalApplication = require("../models/RentalApplication");
const Unit = require("../models/Unit");
const Lease = require("../models/Lease");

// @desc    Get all applications
// @route   GET /api/applications
// @access  Private/Admin
const getApplications = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};

    if (status) {
      filter.status = status;
    }

    const applications = await RentalApplication.find(filter)
      .populate("tenantId", "name email contactNumber")
      .populate("unitId", "unitNumber type floor price")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single application
// @route   GET /api/applications/:id
// @access  Private
const getApplication = async (req, res) => {
  try {
    const application = await RentalApplication.findById(req.params.id)
      .populate("tenantId", "name email contactNumber address")
      .populate("unitId", "unitNumber type floor price status");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    // Tenants can only view their own applications
    if (
      req.user.role === "tenant" &&
      application.tenantId._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this application",
      });
    }

    res.status(200).json({
      success: true,
      application,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get tenant's own applications
// @route   GET /api/applications/my/applications
// @access  Private/Tenant
const getMyApplications = async (req, res) => {
  try {
    const applications = await RentalApplication.find({
      tenantId: req.user.id,
    })
      .populate("unitId", "unitNumber type floor price status")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create application
// @route   POST /api/applications
// @access  Private/Tenant
const createApplication = async (req, res) => {
  try {
    const { unitId, moveInDate, message } = req.body;

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
        message: "Unit is not available for rent",
      });
    }

    // Check if tenant already has an active lease
    const activeLease = await Lease.findOne({
      tenantId: req.user.id,
      status: "active",
    });

    if (activeLease) {
      return res.status(400).json({
        success: false,
        message: "You already have an active lease",
      });
    }

    // Check if tenant already has a pending application for this unit
    const existingApplication = await RentalApplication.findOne({
      tenantId: req.user.id,
      unitId,
      status: "pending",
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: "You already have a pending application for this unit",
      });
    }

    const application = await RentalApplication.create({
      tenantId: req.user.id,
      unitId,
      moveInDate,
      message,
    });

    const populatedApplication = await RentalApplication.findById(
      application._id,
    )
      .populate("tenantId", "name email contactNumber")
      .populate("unitId", "unitNumber type floor price");

    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      application: populatedApplication,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update application status
// @route   PUT /api/applications/:id/status
// @access  Private/Admin
const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["pending", "approved", "denied"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be pending, approved, or denied",
      });
    }

    const application = await RentalApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    // If approving, check if unit is still available
    if (status === "approved") {
      const unit = await Unit.findById(application.unitId);
      if (unit.status !== "available") {
        return res.status(400).json({
          success: false,
          message: "Unit is no longer available",
        });
      }

      // Check if tenant already has an active lease
      const activeLease = await Lease.findOne({
        tenantId: application.tenantId,
        status: "active",
      });

      if (activeLease) {
        return res.status(400).json({
          success: false,
          message: "Tenant already has an active lease",
        });
      }
    }

    application.status = status;
    await application.save();

    const updatedApplication = await RentalApplication.findById(application._id)
      .populate("tenantId", "name email contactNumber")
      .populate("unitId", "unitNumber type floor price");

    res.status(200).json({
      success: true,
      message: `Application ${status} successfully`,
      application: updatedApplication,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete application
// @route   DELETE /api/applications/:id
// @access  Private/Tenant (own) or Admin
const deleteApplication = async (req, res) => {
  try {
    const application = await RentalApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    // Tenants can only delete their own pending applications
    if (req.user.role === "tenant") {
      if (application.tenantId.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to delete this application",
        });
      }

      if (application.status !== "pending") {
        return res.status(400).json({
          success: false,
          message: "Can only delete pending applications",
        });
      }
    }

    await RentalApplication.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Application deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getApplications,
  getApplication,
  getMyApplications,
  createApplication,
  updateApplicationStatus,
  deleteApplication,
};
