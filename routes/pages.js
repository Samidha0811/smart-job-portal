const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const Seeker = require('../models/seekerModel');

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
    res.render('login', { title: 'Login - Smart Job Portal', error: req.query.error });
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

router.get('/recruiter/applications', auth(['recruiter']), (req, res) => {
    res.render('recruiter-applications', { title: 'Applications Received' });
});

router.get('/recruiter/my-jobs', auth(['recruiter']), (req, res) => {
    res.render('recruiter-jobs', { title: 'Posted Jobs' });
});

// Seeker Pages (Protected)
router.get('/seeker/dashboard', auth(['seeker']), async (req, res) => {
    try {
        const profile = await Seeker.getDetailsByUserId(req.user.id);
        if (!profile) {
            return res.redirect('/seeker/complete-profile');
        }
        res.render('seeker-dashboard', { 
            title: 'Seeker Dashboard', 
            user: { ...req.user, fullname: profile.fullname || req.user.fullname }, 
            profile 
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/seeker/complete-profile', auth(['seeker']), (req, res) => {
    res.render('seeker-complete-profile', { title: 'Complete Your Profile' });
});

router.get('/seeker/my-applications', auth(['seeker']), (req, res) => {
    res.render('seeker-dashboard', { title: 'My Applications' }); 
});

module.exports = router;
