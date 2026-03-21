const mongoose = require('mongoose')

const UnitSchema = new mongoose.Schema({
  unitNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['studio', 'one-bedroom', 'two-bedroom', 'three-bedroom'],
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  floor: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['available', 'occupied'],
    default: 'available'
  },
  images: [
    {
      type: String
    }
  ]
}, { timestamps: true })

module.exports = mongoose.model('Unit', UnitSchema)