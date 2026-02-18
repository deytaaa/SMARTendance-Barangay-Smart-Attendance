const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getAllDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} = require('../controllers/departmentController');

router.get('/', protect, getAllDepartments);
router.get('/:id', protect, getDepartment);
router.post('/', protect, authorize('ADMIN'), createDepartment);
router.put('/:id', protect, authorize('ADMIN'), updateDepartment);
router.delete('/:id', protect, authorize('ADMIN'), deleteDepartment);

module.exports = router;
