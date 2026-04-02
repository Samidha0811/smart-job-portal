const express = require('express');
const router = express.Router();
const seekerController = require('../controllers/seekerController');
const auth = require('../middleware/auth');
const multer = require('multer');

// Multer Config for Resumes (In-Memory Storage)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Protect all seeker routes
router.use(auth(['seeker']));

// Profile Routes
router.post('/complete-profile', upload.single('resume'), seekerController.submitProfile);
router.get('/profile', seekerController.getMyApplications); // Placeholder or actual profile fetch

// Job Routes
router.get('/jobs', seekerController.getJobs);

// Application Routes
router.post('/apply/:jobId', seekerController.applyToJob);
router.get('/my-applications', seekerController.getMyApplications);

module.exports = router;
