const express = require('express');
const router = express.Router();
const { protect, authorize, authenticateDevice } = require('../middleware/auth');
const {
  checkIn,
  checkOut,
  getAllAttendance,
  getTodayAttendance,
  getUserAttendance,
  getAttendanceReport,
  deleteAttendance,
} = require('../controllers/attendanceController');

// IoT Device routes (can also be used manually by admin/staff)
router.post('/check-in', protect, checkIn);
router.post('/check-out', protect, checkOut);

// Admin/Staff routes
router.get('/', protect, authorize('ADMIN', 'STAFF'), getAllAttendance);
router.get('/today', protect, authorize('ADMIN', 'STAFF'), getTodayAttendance);
router.get('/report', protect, authorize('ADMIN', 'STAFF'), getAttendanceReport);
router.get('/user/:userId', protect, getUserAttendance);
router.delete('/:id', protect, authorize('ADMIN'), deleteAttendance);

module.exports = router;
