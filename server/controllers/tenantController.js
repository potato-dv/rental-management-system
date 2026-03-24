const User = require("../models/User");
const Lease = require("../models/Lease");

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
    res.status(500).json({
      success: false,
      message: error.message,
    });
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
    res.status(500).json({
      success: false,
      message: error.message,
    });
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
    res.status(500).json({
      success: false,
      message: error.message,
    });
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
    res.status(500).json({
      success: false,
      message: error.message,
    });
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
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete tenant
// @route   DELETE /api/tenants/:id
// @access  Private/Admin
const deleteTenant = async (req, res) => {
  try {
    // Check if tenant has active lease
    const activeLease = await Lease.findOne({
      tenantId: req.params.id,
      status: "active",
    });

    if (activeLease) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete tenant with active lease. Terminate lease first.",
      });
    }

    const tenant = await User.findOneAndDelete({
      _id: req.params.id,
      role: "tenant",
    });

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: "Tenant not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Tenant deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
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
