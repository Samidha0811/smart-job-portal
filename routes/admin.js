const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');

// Protect all admin routes
router.use(auth(['admin']));

// Admin Dashboard Page
router.get('/', adminController.getDashboard);

// View Recruiter Details
router.get('/recruiter/:id', adminController.getRecruiterDetails);

// Admin Approve API
router.put('/approve/:userId', adminController.approveRecruiter);

// Admin Reject API
router.put('/reject/:userId', adminController.rejectRecruiter);

module.exports = router;
