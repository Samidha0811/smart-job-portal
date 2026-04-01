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

module.exports = router;
