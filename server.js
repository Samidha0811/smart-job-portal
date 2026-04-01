const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcrypt');
const db = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// View Engine Setup (EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// (Removed temporary in-memory storage)

// Temporary In-Memory Storage (Level 1)
const users = [];

// Basic Routes
app.get('/', (req, res) => {
    res.render('index', { title: 'Smart Job Portal - Home' });
});

app.get('/register', (req, res) => {
    res.render('register', { title: 'Register - Smart Job Portal' });
});

app.get('/login', (req, res) => {
    res.render('login', { title: 'Login - Smart Job Portal' });
});

app.get('/jobs', (req, res) => {
    res.render('jobs', { title: 'Jobs - Smart Job Portal' });
});

// Admin Dashboard Route
app.get('/admin', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, fullname, email, status FROM users WHERE role = "recruiter" AND status = "pending"');
        res.render('admin', { title: 'Admin Dashboard', recruiters: rows });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error loading admin panel');
    }
});

// Admin API Routes
app.post('/api/admin/approve', async (req, res) => {
    const { userId } = req.body;
    try {
        await db.query('UPDATE users SET status = "approved" WHERE id = ?', [userId]);
        res.redirect('/admin');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error approving user');
    }
});

app.post('/api/admin/reject', async (req, res) => {
    const { userId } = req.body;
    try {
        await db.query('UPDATE users SET status = "rejected" WHERE id = ?', [userId]);
        res.redirect('/admin');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error rejecting user');
    }
});

// API Routes for Form Submissions (Level 3 - Database)
app.post('/api/register', async (req, res) => {
    const { username, email, password, role } = req.body;
    
    // Server-side validation
    if (!username || !email || !password || !role) {
        return res.status(400).send('All fields are required.');
    }

    try {
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Recruiter status is 'pending' until Admin approval
        const status = (role === 'recruiter') ? 'pending' : 'active';
        
        // Insert into MySQL
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
        res.status(500).send('<h1>Server Error</h1><p>Something went wrong with the database. Please ensure your MySQL server is running and configured.</p>');
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        const user = rows[0];

        if (user && await bcrypt.compare(password, user.password)) {
            // Check if recruiter is approved
            if (user.role === 'recruiter' && user.status === 'pending') {
                return res.send('<h1>Wait for Approval</h1><p>Your recruiter account is still pending admin approval.</p><a href="/">Back to Home</a>');
            }

            res.send(`<h1>Login Successful!</h1><p>Welcome back, ${user.fullname} (${user.role})</p><a href="/">Back to Home</a>`);
        } else {
            res.status(401).send('<h1>Login Failed</h1><p>Invalid email or password.</p><a href="/login">Try Again</a>');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
