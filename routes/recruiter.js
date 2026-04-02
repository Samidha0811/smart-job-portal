const express = require('express');
const router = express.Router();
const db = require('../config/db');
const recruiterController = require('../controllers/recruiterController');
const auth = require('../middleware/auth');
const multer = require('multer');

// Multer Config for Documents
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/documents');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Register Details API (Step 2)
router.post('/register-details', upload.fields([
    { name: 'registration_cert', maxCount: 1 },
    { name: 'gst_doc', maxCount: 1 },
    { name: 'pan_doc', maxCount: 1 }
]), recruiterController.registerDetails);

// Protect all following recruiter routes
router.use(auth(['recruiter']));

// Profile Routes
router.post('/profile', recruiterController.updateProfile);
router.get('/profile', recruiterController.getMyProfile);

// Job Routes
router.post('/post-job', recruiterController.postJob);
router.get('/my-jobs', recruiterController.getMyJobs);

// Application Routes
router.get('/applicants/:jobId', recruiterController.getJobApplicants);
router.patch('/applications/:applicationId/status', recruiterController.updateApplicationStatus);
router.get('/all-applications', recruiterController.getAllApplications);

module.exports = router;
