const Unit = require("../models/Unit");
const { sendServerError } = require("../utils/errorResponse");

// @desc    Get all units
// @route   GET /api/units
// @access  Public
const getUnits = async (req, res) => {
  try {
    const units = await Unit.find();
    res.status(200).json({
      success: true,
      count: units.length,
      units,
    });
  } catch (error) {
    return sendServerError(res, error);
  }
};

// @desc    Get single unit
// @route   GET /api/units/:id
// @access  Public
const getUnit = async (req, res) => {
  try {
    const unit = await Unit.findById(req.params.id);
    if (!unit) {
      return res.status(404).json({
        success: false,
        message: "Unit not found",
      });
    }
    res.status(200).json({
      success: true,
      unit,
    });
  } catch (error) {
    return sendServerError(res, error);
  }
};

// @desc    Update unit
// @route   PUT /api/units/:id
// @access  Private/Admin
const updateUnit = async (req, res) => {
  try {
    const unit = await Unit.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!unit) {
      return res.status(404).json({
        success: false,
        message: "Unit not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Unit updated successfully",
      unit,
    });
  } catch (error) {
    return sendServerError(res, error);
  }
};

module.exports = { getUnits, getUnit, updateUnit };
