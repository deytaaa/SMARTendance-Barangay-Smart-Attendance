const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getAllBarangays,
  getBarangay,
  createBarangay,
  updateBarangay,
  deleteBarangay,
  getSettings,
  updateSettings,
} = require('../controllers/barangayController');

router.get('/settings', protect, getSettings);
router.put('/settings', protect, authorize('ADMIN'), updateSettings);
router.get('/', protect, getAllBarangays);
router.get('/:id', protect, getBarangay);
router.post('/', protect, authorize('ADMIN'), createBarangay);
router.put('/:id', protect, authorize('ADMIN'), updateBarangay);
router.delete('/:id', protect, authorize('ADMIN'), deleteBarangay);

module.exports = router;
