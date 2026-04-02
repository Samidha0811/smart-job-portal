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
router.post('/approve', adminController.approveRecruiter);

// Admin Reject API
router.post('/reject', adminController.rejectRecruiter);

module.exports = router;
