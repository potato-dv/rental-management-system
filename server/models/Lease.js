const mongoose = require('mongoose')

const LeaseSchema = new mongoose.Schema({
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
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  monthlyRent: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'terminated'],
    default: 'active'
  }
}, { timestamps: true })

module.exports = mongoose.model('Lease', LeaseSchema)