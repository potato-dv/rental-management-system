const Unit = require("../models/Unit");
const Lease = require("../models/Lease");
const RentalApplication = require("../models/RentalApplication");
const MaintenanceRequest = require("../models/MaintenanceRequest");
const { sendServerError } = require("../utils/errorResponse");

const isUnitNumberDuplicateError = (error) => {
  return error?.code === 11000 && error?.keyPattern?.unitNumber;
};

const escapeRegex = (value) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const findUnitWithSameNumber = (unitNumber, currentUnitId) => {
  const normalizedUnitNumber = unitNumber.trim();
  const query = {
    unitNumber: {
      $regex: `^${escapeRegex(normalizedUnitNumber)}$`,
      $options: "i",
    },
  };

  if (currentUnitId) {
    query._id = { $ne: currentUnitId };
  }

  return Unit.findOne(query);
};

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
    if (req.body.unitNumber !== undefined) {
      const duplicateUnit = await findUnitWithSameNumber(
        req.body.unitNumber,
        req.params.id,
      );

      if (duplicateUnit) {
        return res.status(400).json({
          success: false,
          message: "Unit number already exists",
        });
      }
    }

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
    if (isUnitNumberDuplicateError(error)) {
      return res.status(400).json({
        success: false,
        message: "Unit number already exists",
      });
    }

    return sendServerError(res, error);
  }
};

// @desc    Create unit
// @route   POST /api/units
// @access  Private/Admin
const createUnit = async (req, res) => {
  try {
    // IDINAGDAG ANG 'property' DITO
    const { unitNumber, type, price, floor, description, status, images, property } =
      req.body;

    const existingUnit = await findUnitWithSameNumber(unitNumber);
    if (existingUnit) {
      return res.status(400).json({
        success: false,
        message: "Unit number already exists",
      });
    }

    const unit = await Unit.create({
      unitNumber,
      property: property || "Rentix Property", // IDINAGDAG ITO PARA MA-SAVE
      type,
      price,
      floor,
      description,
      status: status || "available",
      images: Array.isArray(images) ? images : [],
    });

    res.status(201).json({
      success: true,
      message: "Unit created successfully",
      unit,
    });
  } catch (error) {
    if (isUnitNumberDuplicateError(error)) {
      return res.status(400).json({
        success: false,
        message: "Unit number already exists",
      });
    }

    return sendServerError(res, error);
  }
};

// @desc    Delete unit
// @route   DELETE /api/units/:id
// @access  Private/Admin
const deleteUnit = async (req, res) => {
  try {
    const unit = await Unit.findById(req.params.id);

    if (!unit) {
      return res.status(404).json({
        success: false,
        message: "Unit not found",
      });
    }

    const [activeLease, existingLease, existingApplication, existingRequest] =
      await Promise.all([
        Lease.findOne({ unitId: req.params.id, status: "active" }),
        Lease.findOne({ unitId: req.params.id }),
        RentalApplication.findOne({ unitId: req.params.id }),
        MaintenanceRequest.findOne({ unitId: req.params.id }),
      ]);

    if (activeLease) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete unit with active lease",
      });
    }

    if (existingLease || existingApplication || existingRequest) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete unit linked to lease, application, or maintenance records",
      });
    }

    await unit.deleteOne();

    res.status(200).json({
      success: true,
      message: "Unit deleted successfully",
    });
  } catch (error) {
    return sendServerError(res, error);
  }
};

module.exports = { getUnits, getUnit, updateUnit, createUnit, deleteUnit };