const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

// Protect all seeker routes
router.use(auth(['seeker']));

// Get all open jobs
router.get('/jobs', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT j.*, p.company_name FROM jobs j JOIN profiles p ON j.recruiter_id = p.user_id WHERE j.status = "open" ORDER BY j.created_at DESC'
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching jobs' });
    }
});

// Apply to a job
router.post('/apply/:jobId', async (req, res) => {
    const seekerId = req.user.id;
    const jobId = req.params.jobId;
    const { resume_path } = req.body; // Mocking resume_path for now

    try {
        // Check if already applied
        const [existing] = await db.query(
            'SELECT * FROM applications WHERE job_id = ? AND seeker_id = ?',
            [jobId, seekerId]
        );

        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: 'You have already applied for this job.' });
        }

        await db.query(
            'INSERT INTO applications (job_id, seeker_id, resume_path) VALUES (?, ?, ?)',
            [jobId, seekerId, resume_path || '']
        );

        res.json({ success: true, message: 'Application submitted successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error submitting application' });
    }
});

// Get own applications
router.get('/my-applications', async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT a.*, j.title as job_title, p.company_name 
             FROM applications a 
             JOIN jobs j ON a.job_id = j.id 
             JOIN profiles p ON j.recruiter_id = p.user_id 
             WHERE a.seeker_id = ? 
             ORDER BY a.applied_at DESC`,
            [req.user.id]
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching applications' });
    }
});

module.exports = router;
