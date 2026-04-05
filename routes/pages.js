const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const Seeker = require('../models/seekerModel');
const Job = require('../models/jobModel');
const seekerController = require('../controllers/seekerController');

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

router.get('/recruiter/job-applicants/:jobId', auth(['recruiter']), async (req, res) => {
    try {
        const jobId = req.params.jobId;
        const job = await Job.getById(jobId);
        if (!job) {
            return res.status(404).send('Job not found');
        }
        res.render('recruiter-job-applicants', { 
            title: `Applicants - ${job.title}`, 
            job 
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

// Seeker Pages (Protected)
router.get('/seeker/dashboard', auth(['seeker']), async (req, res) => {
    try {
        const profile = await Seeker.getFullProfile(req.user.id);
        if (!profile) {
            return res.redirect('/seeker/profile-setup');
        }
        res.render('seeker-dashboard', { 
            title: 'Seeker Dashboard', 
            user: { ...req.user, fullname: profile.full_name || req.user.fullname }, 
            profile 
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/seeker/profile-setup', auth(['seeker']), async (req, res) => {
    try {
        const profile = await Seeker.getFullProfile(req.user.id);
        res.render('seeker-profile-setup', { 
            title: 'Professional Profile Setup',
            user: req.user,
            profile: profile || {}
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error loading profile setup page');
    }
});

router.get('/seeker/complete-profile', auth(['seeker']), (req, res) => {
    res.redirect('/seeker/profile-setup');
});

router.get('/seeker/interview-prep/:jobId', auth(['seeker']), seekerController.renderInterviewPrep);


module.exports = router;
