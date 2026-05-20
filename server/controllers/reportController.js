const Report = require("../models/Report");
const { sendServerError } = require("../utils/errorResponse");

// @desc    Get all reports (Smart: Admin sees all, Tenant sees own)
// @route   GET /api/reports
const getReports = async (req, res) => {
  try {
    let filter = {};
    
    // Kung tenant ang nag-request, yung kanya lang ang ibibigay natin
    if (req.user.role === "tenant") {
      filter.tenantId = req.user.id;
    }

    const reports = await Report.find(filter)
      .populate("tenantId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error) {
    return sendServerError(res, error);
  }
};

// @desc    Create a new report
// @route   POST /api/reports
const createReport = async (req, res) => {
  try {
    const { title, category, description } = req.body;

    const report = await Report.create({
      tenantId: req.user.id,
      title,
      category,
      description,
    });

    res.status(201).json({
      success: true,
      message: "Report submitted successfully",
      report,
    });
  } catch (error) {
    return sendServerError(res, error);
  }
};

// @desc    Update report status
// @route   PUT /api/reports/:id/status
const updateReportStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["pending", "reviewed", "resolved"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate("tenantId", "name");

    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }

    res.status(200).json({ success: true, report });
  } catch (error) {
    return sendServerError(res, error);
  }
};

// @desc    Delete a report
// @route   DELETE /api/reports/:id
const deleteReport = async (req, res) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);

    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }

    res.status(200).json({ success: true, message: "Report deleted" });
  } catch (error) {
    return sendServerError(res, error);
  }
};

module.exports = {
  getReports,
  createReport,
  updateReportStatus,
  deleteReport,
};