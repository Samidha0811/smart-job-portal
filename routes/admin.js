const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

// Protect all admin routes
router.use(auth(['admin']));

// Admin Dashboard Page
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT u.id, u.fullname, u.email, u.status, rd.company_name, rd.created_at as submitted_at
            FROM users u
            LEFT JOIN recruiter_details rd ON u.id = rd.user_id
            WHERE u.role = "recruiter" AND u.status = "pending"
            ORDER BY rd.created_at DESC
        `);
        res.render('admin', { title: 'Admin Dashboard', recruiters: rows });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error loading admin panel');
    }
});

// View Recruiter Details
router.get('/recruiter/:id', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT u.*, rd.* 
            FROM users u
            JOIN recruiter_details rd ON u.id = rd.user_id
            WHERE u.id = ?
        `, [req.params.id]);

        if (rows.length === 0) {
            return res.status(404).send('Recruiter not found');
        }

        res.render('admin-recruiter-review', { title: 'Review Recruiter', recruiter: rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error loading recruiter details');
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
