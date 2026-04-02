const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');

// General Page Routes
router.get('/', (req, res) => {
    res.render('index', { title: 'Smart Job Portal - Home' });
});

router.get('/register', (req, res) => {
    res.render('register', { title: 'Register - Smart Job Portal' });
});

router.get('/recruiter/register-details', (req, res) => {
    res.render('recruiter-register-details', { title: 'Recruiter Details - Smart Job Portal' });
});

router.get('/login', (req, res) => {
    res.render('login', { title: 'Login - Smart Job Portal' });
});

router.get('/jobs', (req, res) => {
    res.render('jobs', { title: 'Jobs - Smart Job Portal' });
});

// Recruiter Pages (Protected)
router.get('/recruiter/dashboard', auth(['recruiter']), (req, res) => {
    res.render('recruiter-dashboard', { title: 'Recruiter Dashboard' });
});

router.get('/recruiter/create-profile', auth(['recruiter']), (req, res) => {
    res.render('create-profile', { title: 'Create Company Profile' });
});

router.get('/recruiter/post-job', auth(['recruiter']), (req, res) => {
    res.render('post-job', { title: 'Post a New Job' });
});

// Seeker Pages (Protected)
router.get('/seeker/dashboard', auth(['seeker']), (req, res) => {
    res.render('seeker-dashboard', { title: 'Seeker Dashboard' });
});

router.get('/seeker/my-applications', auth(['seeker']), (req, res) => {
    res.render('seeker-dashboard', { title: 'My Applications' }); // Reuse same dashboard or create separate
});

module.exports = router;
