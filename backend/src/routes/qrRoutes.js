const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  generateQRCards,
  generateSingleQRCard,
  getAllQRCards,
  getQRCard,
  downloadQRCard,
} = require('../controllers/qrController');

// Admin/Staff routes for QR card management
router.post('/generate', protect, authorize('ADMIN', 'STAFF'), generateQRCards);
router.post('/generate/:userId', protect, authorize('ADMIN', 'STAFF'), generateSingleQRCard);
router.get('/', protect, authorize('ADMIN', 'STAFF'), getAllQRCards);
router.get('/download/:userId', protect, authorize('ADMIN', 'STAFF'), downloadQRCard);
router.get('/:userId', protect, authorize('ADMIN', 'STAFF'), getQRCard);

module.exports = router;