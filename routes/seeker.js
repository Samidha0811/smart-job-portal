const express = require('express');
const router = express.Router();
const seekerController = require('../controllers/seekerController');
const auth = require('../middleware/auth');
const multer = require('multer');

// Multer Config — In-Memory Storage for resume + cert documents
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Protect all seeker routes
router.use(auth(['seeker']));

// Profile Routes
router.get('/profile-setup', seekerController.renderProfileSetup);
router.post('/complete-profile', upload.fields([
    { name: 'resume', maxCount: 1 },
    { name: 'cert_files', maxCount: 10 }
]), seekerController.submitProfile);
router.get('/api/profile', seekerController.getProfile);
router.get('/profile', seekerController.getMyApplications); // Compatibility/Applications view

// Job Routes
router.get('/jobs', seekerController.getJobs);

// Application Routes
router.post('/apply/:jobId', seekerController.applyToJob);
router.get('/my-applications', seekerController.getMyApplications);

// Certification Document Route (accessible via recruiter link)
router.get('/cert-document/:certId', seekerController.getCertDocument);

module.exports = router;

