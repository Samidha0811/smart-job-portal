const express = require('express');
const router = express.Router();

// General Page Routes
router.get('/', (req, res) => {
    res.render('index', { title: 'Smart Job Portal - Home' });
});

router.get('/register', (req, res) => {
    res.render('register', { title: 'Register - Smart Job Portal' });
});

router.get('/login', (req, res) => {
    res.render('login', { title: 'Login - Smart Job Portal' });
});

router.get('/jobs', (req, res) => {
    res.render('jobs', { title: 'Jobs - Smart Job Portal' });
});

module.exports = router;
