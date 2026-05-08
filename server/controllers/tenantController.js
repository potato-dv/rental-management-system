const User = require("../models/User");
const Lease = require("../models/Lease");
const Unit = require("../models/Unit");
const Payment = require("../models/Payment");
const { sendServerError } = require("../utils/errorResponse");

// @desc    Get all tenants
// @route   GET /api/tenants
// @access  Private/Admin
const getTenants = async (req, res) => {
  try {
    const tenants = await User.find({ role: "tenant" }).select("-password");
    res.status(200).json({
      success: true,
      count: tenants.length,
      tenants,
    });
  } catch (error) {
    return sendServerError(res, error);
  }
};

// @desc    Get single tenant
// @route   GET /api/tenants/:id
// @access  Private/Admin
const getTenant = async (req, res) => {
  try {
    const tenant = await User.findOne({
      _id: req.params.id,
      role: "tenant",
    }).select("-password");

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: "Tenant not found",
      });
    }

    // Get tenant's active lease
    const activeLease = await Lease.findOne({
      tenantId: tenant._id,
      status: "active",
    }).populate("unitId", "unitNumber type floor");

    res.status(200).json({
      success: true,
      tenant,
      activeLease,
    });
  } catch (error) {
    return sendServerError(res, error);
  }
};

// @desc    Get tenant profile (own data)
// @route   GET /api/tenants/profile/me
// @access  Private/Tenant
const getMyProfile = async (req, res) => {
  try {
    const tenant = await User.findById(req.user.id).select("-password");

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: "Tenant not found",
      });
    }

    // Get tenant's active lease
    const activeLease = await Lease.findOne({
      tenantId: tenant._id,
      status: "active",
    }).populate("unitId", "unitNumber type floor price");

    res.status(200).json({
      success: true,
      tenant,
      activeLease,
    });
  } catch (error) {
    return sendServerError(res, error);
  }
};

// @desc    Update tenant profile
// @route   PUT /api/tenants/:id
// @access  Private/Admin
const updateTenant = async (req, res) => {
  try {
    // Don't allow role or password changes through this endpoint
    const { role, password, ...updateData } = req.body;

    const tenant = await User.findOneAndUpdate(
      { _id: req.params.id, role: "tenant" },
      updateData,
      { new: true, runValidators: true },
    ).select("-password");

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: "Tenant not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Tenant updated successfully",
      tenant,
    });
  } catch (error) {
    return sendServerError(res, error);
  }
};

// @desc    Update own profile
// @route   PUT /api/tenants/profile/me
// @access  Private/Tenant
const updateMyProfile = async (req, res) => {
  try {
    // Only allow specific fields to be updated
    const { name, contactNumber, address } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (contactNumber) updateData.contactNumber = contactNumber;
    if (address) updateData.address = address;

    const tenant = await User.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: "Tenant not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      tenant,
    });
  } catch (error) {
    return sendServerError(res, error);
  }
};

// @desc    Remove tenant (Evict & Downgrade to regular user)
// @route   DELETE /api/tenants/:id
// @access  Private/Admin
const deleteTenant = async (req, res) => {
  try {
    // 1. Hanapin muna kung may hawak siyang unit (Active Lease)
    const activeLease = await Lease.findOne({
      tenantId: req.params.id,
      status: "active",
    });

    // 2. Cascade Clean-up (Tatanggalin lang ang kontrata at utang)
    if (activeLease) {
      // Ibalik sa 'available' yung Unit
      if (activeLease.unitId) {
        await Unit.findByIdAndUpdate(activeLease.unitId, { status: "available" });
      }

      // Burahin ang pending payments ng lease na ito
      await Payment.deleteMany({ leaseId: activeLease._id, status: "pending" });

      // Burahin ang kontrata (Lease)
      await Lease.findByIdAndDelete(activeLease._id);
    }

    // 3. IMBES NA I-DELETE, I-DOWNGRADE LANG ANG ROLE NIYA
    const tenant = await User.findByIdAndUpdate(
      req.params.id,
      { role: "user" }, // Babalik siya sa pagiging normal na user/applicant
      { new: true }
    );

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: "Tenant not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Tenant successfully removed from unit but account remains active.",
    });
  } catch (error) {
    return sendServerError(res, error);
  }
};

module.exports = {
  getTenants,
  getTenant,
  getMyProfile,
  updateTenant,
  updateMyProfile,
  deleteTenant,
};