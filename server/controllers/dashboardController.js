const Unit = require("../models/Unit");
const User = require("../models/User");
const Lease = require("../models/Lease");
const Payment = require("../models/Payment");
const MaintenanceRequest = require("../models/MaintenanceRequest");
const RentalApplication = require("../models/RentalApplication");
const { sendServerError } = require("../utils/errorResponse");

// @desc    Get admin dashboard stats
// @route   GET /api/dashboard/admin
// @access  Private/Admin
const getAdminDashboard = async (req, res) => {
  try {
    // Unit statistics
    const totalUnits = await Unit.countDocuments();
    const occupiedUnits = await Unit.countDocuments({ status: "occupied" });
    const availableUnits = await Unit.countDocuments({ status: "available" });
    const occupancyRate = ((occupiedUnits / totalUnits) * 100).toFixed(2);

    // Tenant statistics
    const totalTenants = await User.countDocuments({ role: "tenant" });
    const activeLeases = await Lease.countDocuments({ status: "active" });

    // Application statistics
    const pendingApplications = await RentalApplication.countDocuments({
      status: "pending",
    });
    const approvedApplications = await RentalApplication.countDocuments({
      status: "approved",
    });

    // Payment statistics
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const monthlyRevenue = await Payment.aggregate([
      {
        $match: {
          status: "verified",
          paidDate: { $gte: currentMonth, $lt: nextMonth },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    const pendingPayments = await Payment.countDocuments({ status: "pending" });
    const overduePayments = await Payment.countDocuments({ status: "overdue" });

    // Maintenance statistics
    const openMaintenance = await MaintenanceRequest.countDocuments({
      status: "open",
    });
    const inProgressMaintenance = await MaintenanceRequest.countDocuments({
      status: "in-progress",
    });
    const highPriorityMaintenance = await MaintenanceRequest.countDocuments({
      status: { $ne: "resolved" },
      priority: "high",
    });

    // Recent activities
    const recentApplications = await RentalApplication.find()
      .populate("tenantId", "name email")
      .populate("unitId", "unitNumber type")
      .sort({ createdAt: -1 })
      .limit(5);

    const recentMaintenanceRequests = await MaintenanceRequest.find()
      .populate("tenantId", "name")
      .populate("unitId", "unitNumber")
      .sort({ createdAt: -1 })
      .limit(5);

    // Revenue trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const revenueTrends = await Payment.aggregate([
      {
        $match: {
          status: "verified",
          paidDate: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$paidDate" },
            month: { $month: "$paidDate" },
          },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]);

    res.status(200).json({
      success: true,
      dashboard: {
        units: {
          total: totalUnits,
          occupied: occupiedUnits,
          available: availableUnits,
          occupancyRate: `${occupancyRate}%`,
        },
        tenants: {
          total: totalTenants,
          activeLeases,
        },
        applications: {
          pending: pendingApplications,
          approved: approvedApplications,
        },
        payments: {
          monthlyRevenue:
            monthlyRevenue.length > 0 ? monthlyRevenue[0].total : 0,
          pending: pendingPayments,
          overdue: overduePayments,
        },
        maintenance: {
          open: openMaintenance,
          inProgress: inProgressMaintenance,
          highPriority: highPriorityMaintenance,
        },
        recentActivities: {
          applications: recentApplications,
          maintenanceRequests: recentMaintenanceRequests,
        },
        revenueTrends,
      },
    });
  } catch (error) {
    return sendServerError(res, error);
  }
};

// @desc    Get tenant dashboard stats
// @route   GET /api/dashboard/tenant
// @access  Private/Tenant
const getTenantDashboard = async (req, res) => {
  try {
    // Get tenant's active lease
    const activeLease = await Lease.findOne({
      tenantId: req.user.id,
      status: "active",
    }).populate("unitId", "unitNumber type floor price");

    // Get payment history
    const payments = await Payment.find({ tenantId: req.user.id })
      .sort({ dueDate: -1 })
      .limit(10);

    // Payment statistics
    const pendingPayments = await Payment.countDocuments({
      tenantId: req.user.id,
      status: "pending",
    });

    const overduePayments = await Payment.countDocuments({
      tenantId: req.user.id,
      status: "overdue",
    });

    const totalPaid = await Payment.aggregate([
      {
        $match: {
          tenantId: req.user._id,
          status: "verified",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    // Maintenance requests
    const maintenanceRequests = await MaintenanceRequest.find({
      tenantId: req.user.id,
    })
      .populate("unitId", "unitNumber")
      .sort({ createdAt: -1 })
      .limit(5);

    const openMaintenanceCount = await MaintenanceRequest.countDocuments({
      tenantId: req.user.id,
      status: { $ne: "resolved" },
    });

    // Application status
    const applications = await RentalApplication.find({
      tenantId: req.user.id,
    })
      .populate("unitId", "unitNumber type floor price")
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      dashboard: {
        lease: activeLease,
        payments: {
          recent: payments,
          pending: pendingPayments,
          overdue: overduePayments,
          totalPaid: totalPaid.length > 0 ? totalPaid[0].total : 0,
        },
        maintenance: {
          recent: maintenanceRequests,
          open: openMaintenanceCount,
        },
        applications: applications,
      },
    });
  } catch (error) {
    return sendServerError(res, error);
  }
};

// @desc    Get financial summary
// @route   GET /api/dashboard/financial
// @access  Private/Admin
const getFinancialSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const matchFilter = { status: "verified" };

    if ((startDate && !endDate) || (!startDate && endDate)) {
      return res.status(400).json({
        success: false,
        message: "Both startDate and endDate are required",
      });
    }

    if (startDate && endDate) {
      const parsedStart = new Date(startDate);
      const parsedEnd = new Date(endDate);

      if (
        Number.isNaN(parsedStart.getTime()) ||
        Number.isNaN(parsedEnd.getTime())
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid startDate or endDate",
        });
      }

      if (parsedEnd < parsedStart) {
        return res.status(400).json({
          success: false,
          message: "endDate must be after startDate",
        });
      }

      matchFilter.paidDate = {
        $gte: parsedStart,
        $lte: parsedEnd,
      };
    }

    // Total revenue
    const totalRevenue = await Payment.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    // Revenue by payment method
    const revenueByMethod = await Payment.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: "$paymentMethod",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    // Pending collections
    const pendingCollections = await Payment.aggregate([
      { $match: { status: "pending" } },
      {
        $group: {
          _id: null,
          total: { $sum: "$remainingBalance" },
          count: { $sum: 1 },
        },
      },
    ]);

    // Overdue collections
    const overdueCollections = await Payment.aggregate([
      { $match: { status: "overdue" } },
      {
        $group: {
          _id: null,
          total: { $sum: "$remainingBalance" },
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      financial: {
        totalRevenue:
          totalRevenue.length > 0
            ? {
                amount: totalRevenue[0].total,
                count: totalRevenue[0].count,
              }
            : { amount: 0, count: 0 },
        revenueByMethod,
        pendingCollections:
          pendingCollections.length > 0
            ? {
                amount: pendingCollections[0].total,
                count: pendingCollections[0].count,
              }
            : { amount: 0, count: 0 },
        overdueCollections:
          overdueCollections.length > 0
            ? {
                amount: overdueCollections[0].total,
                count: overdueCollections[0].count,
              }
            : { amount: 0, count: 0 },
      },
    });
  } catch (error) {
    return sendServerError(res, error);
  }
};

module.exports = {
  getAdminDashboard,
  getTenantDashboard,
  getFinancialSummary,
};
