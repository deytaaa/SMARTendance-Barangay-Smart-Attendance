const express = require('express');

const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getSettings, updateSettings } = require('../controllers/systemSettingsController');

router.get('/', protect, getSettings);
router.put('/', protect, authorize('ADMIN'), updateSettings);

module.exports = router;