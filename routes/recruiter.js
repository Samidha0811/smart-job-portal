const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

// Protect all recruiter routes
router.use(auth(['recruiter']));

// Create/Update Company Profile (Uses logged-in user ID)
router.post('/profile', async (req, res) => {
    const userId = req.user.id;
    const { bio, company_name, website } = req.body;
    
    try {
        const [existing] = await db.query('SELECT * FROM profiles WHERE user_id = ?', [userId]);
        
        if (existing.length > 0) {
            await db.query(
                'UPDATE profiles SET bio = ?, company_name = ?, website = ? WHERE user_id = ?',
                [bio, company_name, website, userId]
            );
        } else {
            await db.query(
                'INSERT INTO profiles (user_id, bio, company_name, website) VALUES (?, ?, ?, ?)',
                [userId, bio, company_name, website]
            );
        }
        res.json({ success: true, message: 'Profile updated successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error updating profile' });
    }
});

// Post a New Job (Uses logged-in user ID)
router.post('/post-job', async (req, res) => {
    const recruiterId = req.user.id;
    const { title, description, keywords, location, salary } = req.body;
    
    try {
        const [user] = await db.query('SELECT status FROM users WHERE id = ?', [recruiterId]);
        
        if (!user[0] || user[0].status !== 'approved') {
            return res.status(403).json({ success: false, message: 'Your account must be approved by an Admin to post jobs.' });
        }

        await db.query(
            'INSERT INTO jobs (recruiter_id, title, description, keywords, location, salary) VALUES (?, ?, ?, ?, ?, ?)',
            [recruiterId, title, description, keywords, location, salary]
        );
        res.json({ success: true, message: 'Job posted successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error posting job' });
    }
});

// Get Own Profile (Uses logged-in user ID)
router.get('/profile', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM profiles WHERE user_id = ?', [req.user.id]);
        res.json(rows[0] || null);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Get Own Jobs (Uses logged-in user ID)
router.get('/my-jobs', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM jobs WHERE recruiter_id = ? ORDER BY created_at DESC',
            [req.user.id]
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching jobs' });
    }
});

// Get Applicants for a specific job
router.get('/applicants/:jobId', async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT a.*, u.fullname as seeker_name, u.email as seeker_email 
             FROM applications a 
             JOIN users u ON a.seeker_id = u.id 
             WHERE a.job_id = ?`,
            [req.params.jobId]
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching applicants' });
    }
});

// Update application status
router.patch('/applications/:applicationId/status', async (req, res) => {
    const { status } = req.body;
    const applicationId = req.params.applicationId;

    if (!['pending', 'shortlisted', 'rejected'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    try {
        // Verify the application belongs to a job posted by this recruiter
        const [appRow] = await db.query(
            `SELECT a.* FROM applications a 
             JOIN jobs j ON a.job_id = j.id 
             WHERE a.id = ? AND j.recruiter_id = ?`,
            [applicationId, req.user.id]
        );

        if (appRow.length === 0) {
            return res.status(403).json({ success: false, message: 'Unauthorized to update this application' });
        }

        await db.query(
            'UPDATE applications SET status = ? WHERE id = ?',
            [status, applicationId]
        );

        res.json({ success: true, message: `Application marked as ${status}!` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error updating application status' });
    }
});

// Get all applications for jobs by this recruiter
router.get('/all-applications', async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT a.*, u.fullname as seeker_name, u.email as seeker_email, j.title as job_title 
             FROM applications a 
             JOIN users u ON a.seeker_id = u.id 
             JOIN jobs j ON a.job_id = j.id 
             WHERE j.recruiter_id = ? 
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
