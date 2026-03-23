const express = require('express')
const router = express.Router()
const {
  getUnits,
  getUnit,
  createUnit,
  updateUnit,
  deleteUnit
} = require('../controllers/unitController')
const { protect } = require('../middleware/authMiddleware')
const { authorize } = require('../middleware/roleMiddleware')

router.get('/', getUnits)
router.get('/:id', getUnit)
router.post('/', protect, authorize('admin'), createUnit)
router.put('/:id', protect, authorize('admin'), updateUnit)
router.delete('/:id', protect, authorize('admin'), deleteUnit)

module.exports = router