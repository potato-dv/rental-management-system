const HelpReport = require("../models/HelpReport");
const { isValidObjectId } = require("../middleware/validation");
const { sendServerError } = require("../utils/errorResponse");

// @desc    Get all help/report requests
// @route   GET /api/help-reports
// @access  Private/Admin
const getHelpReports = async (req, res) => {
  try {
    const { category, status, tenantId } = req.query;
    const filter = {};

    if (category) {
      if (!["help", "report"].includes(category)) {
        return res.status(400).json({
          success: false,
          message: "Invalid category. Must be help or report",
        });
      }
      filter.category = category;
    }

    if (status) {
      if (!["open", "in-progress", "resolved"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status. Must be open, in-progress, or resolved",
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

    const requests = await HelpReport.find(filter)
      .populate("tenantId", "name email contactNumber")
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

// @desc    Get single help/report request
// @route   GET /api/help-reports/:id
// @access  Private
const getHelpReport = async (req, res) => {
  try {
    const request = await HelpReport.findById(req.params.id).populate(
      "tenantId",
      "name email contactNumber",
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Help/report request not found",
      });
    }

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

// @desc    Get tenant's own help/report requests
// @route   GET /api/help-reports/my/requests
// @access  Private/Tenant
const getMyHelpReports = async (req, res) => {
  try {
    const requests = await HelpReport.find({ tenantId: req.user.id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    return sendServerError(res, error);
  }
};

// @desc    Create help/report request
// @route   POST /api/help-reports
// @access  Private/Tenant
const createHelpReport = async (req, res) => {
  try {
    const { category, subject, description } = req.body;

    const request = await HelpReport.create({
      tenantId: req.user.id,
      category,
      subject,
      description,
    });

    const populatedRequest = await HelpReport.findById(request._id).populate(
      "tenantId",
      "name email contactNumber",
    );

    res.status(201).json({
      success: true,
      message: "Help/report request submitted successfully",
      request: populatedRequest,
    });
  } catch (error) {
    return sendServerError(res, error);
  }
};

// @desc    Update help/report request status
// @route   PUT /api/help-reports/:id/status
// @access  Private/Admin
const updateHelpReportStatus = async (req, res) => {
  try {
    const { status, adminResponse } = req.body;
    const request = await HelpReport.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Help/report request not found",
      });
    }

    request.status = status;
    request.resolvedAt = status === "resolved" ? Date.now() : undefined;

    if (typeof adminResponse !== "undefined") {
      request.adminResponse = adminResponse;
    }

    await request.save();

    const updatedRequest = await HelpReport.findById(request._id).populate(
      "tenantId",
      "name email contactNumber",
    );

    res.status(200).json({
      success: true,
      message: "Help/report request status updated successfully",
      request: updatedRequest,
    });
  } catch (error) {
    return sendServerError(res, error);
  }
};

// @desc    Delete help/report request
// @route   DELETE /api/help-reports/:id
// @access  Private/Admin
const deleteHelpReport = async (req, res) => {
  try {
    const request = await HelpReport.findByIdAndDelete(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Help/report request not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Help/report request deleted successfully",
    });
  } catch (error) {
    return sendServerError(res, error);
  }
};

module.exports = {
  getHelpReports,
  getHelpReport,
  getMyHelpReports,
  createHelpReport,
  updateHelpReportStatus,
  deleteHelpReport,
};
