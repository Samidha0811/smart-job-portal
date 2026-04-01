const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Admin Dashboard Page
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, fullname, email, status FROM users WHERE role = "recruiter" AND status = "pending"');
        res.render('admin', { title: 'Admin Dashboard', recruiters: rows });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error loading admin panel');
    }
});

// Admin Approve API
router.post('/approve', async (req, res) => {
    const { userId } = req.body;
    try {
        await db.query('UPDATE users SET status = "approved" WHERE id = ?', [userId]);
        res.redirect('/admin');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error approving user');
    }
});

// Admin Reject API
router.post('/reject', async (req, res) => {
    const { userId } = req.body;
    try {
        await db.query('UPDATE users SET status = "rejected" WHERE id = ?', [userId]);
        res.redirect('/admin');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error rejecting user');
    }
});

module.exports = router;
