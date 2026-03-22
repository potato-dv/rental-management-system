const mongoose = require('mongoose')

const PaymentSchema = new mongoose.Schema({
  leaseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lease',
    required: true
  },
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  paidDate: {
    type: Date
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'gcash', 'bank transfer', 'maya'],
    required: true
  },
  recordedBy: {
    type: String,
    enum: ['tenant', 'admin'],
    required: true
  },
  proofOfPayment: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'overdue'],
    default: 'pending'
  },
  receiptPath: {
    type: String
  },
  remainingBalance: {
    type: Number,
    default: 0
  }
}, { timestamps: true })

module.exports = mongoose.model('Payment', PaymentSchema)