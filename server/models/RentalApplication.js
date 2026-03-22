const mongoose = require('mongoose')

const RentalApplicationSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  unitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Unit',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'denied'],
    default: 'pending'
  },
  message: {
    type: String,
    trim: true
  },
  moveInDate: {
    type: Date,
    required: true
  }
}, { timestamps: true })

module.exports = mongoose.model('RentalApplication', RentalApplicationSchema)