const express = require('express');
const router = express.Router();
const seekerController = require('../controllers/seekerController');
const auth = require('../middleware/auth');

// Protect all seeker routes
router.use(auth(['seeker']));

// Job Routes
router.get('/jobs', seekerController.getJobs);

// Application Routes
router.post('/apply/:jobId', seekerController.applyToJob);
router.get('/my-applications', seekerController.getMyApplications);

module.exports = router;
