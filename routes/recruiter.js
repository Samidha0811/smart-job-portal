const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Create/Update Company Profile
router.post('/profile', async (req, res) => {
    const { userId, bio, company_name, website } = req.body;
    
    try {
        // Check if profile exists
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

// Post a New Job
router.post('/post-job', async (req, res) => {
    const { recruiterId, title, description, keywords, location, salary } = req.body;
    
    try {
        // Check if recruiter is approved
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

// Get Profile by User ID
router.get('/profile/:userId', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM profiles WHERE user_id = ?', [req.params.userId]);
        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.json(null);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Get Jobs by Recruiter ID
router.get('/jobs/:recruiterId', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM jobs WHERE recruiter_id = ? ORDER BY created_at DESC',
            [req.params.recruiterId]
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
