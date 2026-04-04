const MaintenanceRequest = require("../models/MaintenanceRequest");
const Lease = require("../models/Lease");
const Unit = require("../models/Unit");
const { sendServerError } = require("../utils/errorResponse");

// @desc    Get all maintenance requests
// @route   GET /api/maintenance
// @access  Private/Admin
const getMaintenanceRequests = async (req, res) => {
  try {
    const { status, priority } = req.query;
    const filter = {};

    const validStatuses = ["open", "in-progress", "resolved"];
    const validPriorities = ["low", "medium", "high"];

    if (status) {
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status. Must be open, in-progress, or resolved",
        });
      }
      filter.status = status;
    }

    if (priority) {
      if (!validPriorities.includes(priority)) {
        return res.status(400).json({
          success: false,
          message: "Invalid priority. Must be low, medium, or high",
        });
      }
      filter.priority = priority;
    }

    const requests = await MaintenanceRequest.find(filter)
      .populate("tenantId", "name email contactNumber")
      .populate("unitId", "unitNumber type floor")
      .populate("repairHistory.updatedBy", "name")
      .sort({ priority: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    return sendServerError(res, error);
  }
};

// @desc    Get single maintenance request
// @route   GET /api/maintenance/:id
// @access  Private
const getMaintenanceRequest = async (req, res) => {
  try {
    const request = await MaintenanceRequest.findById(req.params.id)
      .populate("tenantId", "name email contactNumber")
      .populate("unitId", "unitNumber type floor")
      .populate("repairHistory.updatedBy", "name");

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Maintenance request not found",
      });
    }

    // Tenants can only view their own requests
    if (
      req.user.role === "tenant" &&
      request.tenantId._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this request",
      });
    }

    res.status(200).json({
      success: true,
      request,
    });
  } catch (error) {
    return sendServerError(res, error);
  }
};

// @desc    Get tenant's own maintenance requests
// @route   GET /api/maintenance/my/requests
// @access  Private/Tenant
const getMyMaintenanceRequests = async (req, res) => {
  try {
    const requests = await MaintenanceRequest.find({ tenantId: req.user.id })
      .populate("unitId", "unitNumber type floor")
      .populate("repairHistory.updatedBy", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    return sendServerError(res, error);
  }
};

// @desc    Create maintenance request
// @route   POST /api/maintenance
// @access  Private/Tenant
const createMaintenanceRequest = async (req, res) => {
  try {
    const { unitId, title, description, priority } = req.body;

    // Verify tenant has an active lease for this unit
    const lease = await Lease.findOne({
      tenantId: req.user.id,
      unitId,
      status: "active",
    });

    if (!lease) {
      return res.status(403).json({
        success: false,
        message:
          "You can only submit maintenance requests for your rented unit",
      });
    }

    const request = await MaintenanceRequest.create({
      tenantId: req.user.id,
      unitId,
      title,
      description,
      priority: priority || "low",
    });

    const populatedRequest = await MaintenanceRequest.findById(request._id)
      .populate("tenantId", "name email contactNumber")
      .populate("unitId", "unitNumber type floor");

    res.status(201).json({
      success: true,
      message: "Maintenance request submitted successfully",
      request: populatedRequest,
    });
  } catch (error) {
    return sendServerError(res, error);
  }
};

// @desc    Update maintenance request status
// @route   PUT /api/maintenance/:id/status
// @access  Private/Admin
const updateMaintenanceStatus = async (req, res) => {
  try {
    const { status, note } = req.body;

    if (!["open", "in-progress", "resolved"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be open, in-progress, or resolved",
      });
    }

    const request = await MaintenanceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Maintenance request not found",
      });
    }

    // Add to repair history
    request.repairHistory.push({
      updatedBy: req.user.id,
      status,
      note: note || `Status changed to ${status}`,
      updatedAt: Date.now(),
    });

    request.status = status;
    await request.save();

    const updatedRequest = await MaintenanceRequest.findById(request._id)
      .populate("tenantId", "name email contactNumber")
      .populate("unitId", "unitNumber type floor")
      .populate("repairHistory.updatedBy", "name");

    res.status(200).json({
      success: true,
      message: "Maintenance request updated successfully",
      request: updatedRequest,
    });
  } catch (error) {
    return sendServerError(res, error);
  }
};

// @desc    Update maintenance request priority
// @route   PUT /api/maintenance/:id/priority
// @access  Private/Admin
const updateMaintenancePriority = async (req, res) => {
  try {
    const { priority } = req.body;

    if (!["low", "medium", "high"].includes(priority)) {
      return res.status(400).json({
        success: false,
        message: "Invalid priority. Must be low, medium, or high",
      });
    }

    const request = await MaintenanceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Maintenance request not found",
      });
    }

    request.priority = priority;
    request.repairHistory.push({
      updatedBy: req.user.id,
      status: request.status,
      note: `Priority changed to ${priority}`,
      updatedAt: Date.now(),
    });

    await request.save();

    const updatedRequest = await MaintenanceRequest.findById(request._id)
      .populate("tenantId", "name email contactNumber")
      .populate("unitId", "unitNumber type floor")
      .populate("repairHistory.updatedBy", "name");

    res.status(200).json({
      success: true,
      message: "Priority updated successfully",
      request: updatedRequest,
    });
  } catch (error) {
    return sendServerError(res, error);
  }
};

// @desc    Delete maintenance request
// @route   DELETE /api/maintenance/:id
// @access  Private/Admin
const deleteMaintenanceRequest = async (req, res) => {
  try {
    const request = await MaintenanceRequest.findByIdAndDelete(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Maintenance request not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Maintenance request deleted successfully",
    });
  } catch (error) {
    return sendServerError(res, error);
  }
};

module.exports = {
  getMaintenanceRequests,
  getMaintenanceRequest,
  getMyMaintenanceRequests,
  createMaintenanceRequest,
  updateMaintenanceStatus,
  updateMaintenancePriority,
  deleteMaintenanceRequest,
};
