const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../config/db');

// Register API
router.post('/register', async (req, res) => {
    const { username, email, password, role } = req.body;
    
    if (!username || !email || !password || !role) {
        return res.status(400).send('All fields are required.');
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const status = (role === 'recruiter') ? 'pending' : 'active';
        
        const [result] = await db.query(
            'INSERT INTO users (fullname, email, password, role, status) VALUES (?, ?, ?, ?, ?)',
            [username, email, hashedPassword, role, status]
        );

        console.log('New User Registered in DB:', { id: result.insertId, username, role, status });
        
        const message = (role === 'recruiter') 
            ? 'Registration Successful! Please wait for Admin approval before you can post jobs.' 
            : 'Registration Successful! You can now login.';

        res.send(`<h1>Registration Successful!</h1><p>${message}</p><a href="/login">Go to Login</a>`);
    } catch (err) {
        console.error(err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).send('<h1>Error</h1><p>Email already registered.</p><a href="/register">Try again</a>');
        }
        res.status(500).send('<h1>Server Error</h1><p>Something went wrong with the database.</p>');
    }
});

// Login API
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        const user = rows[0];

        if (user && await bcrypt.compare(password, user.password)) {
            if (user.role === 'admin') {
                return res.redirect('/admin');
            } else if (user.role === 'recruiter') {
                // Redirect recruiter to their dashboard with userId for demo purposes
                return res.redirect(`/recruiter/dashboard?userId=${user.id}`);
            } else {
                return res.send(`<h1>Seeker Dashboard</h1><p>Welcome, ${user.fullname}. Start searching for jobs!</p><a href="/">Back to Home</a>`);
            }
        } else {
            res.status(401).send('<h1>Login Failed</h1><p>Invalid email or password.</p><a href="/login">Try Again</a>');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

// Get User by ID (Simple for demo)
router.get('/user/:userId', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, fullname, email, role, status FROM users WHERE id = ?', [req.params.userId]);
        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
