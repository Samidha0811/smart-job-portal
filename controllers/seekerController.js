const Job = require('../models/jobModel');
const Application = require('../models/applicationModel');
const Seeker = require('../models/seekerModel');

const seekerController = {
    /**
     * Get all open jobs for seekers
     */
    async getJobs(req, res) {
        try {
            const jobs = await Job.getAllOpen();
            res.json(jobs);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Error fetching jobs' });
        }
    },

    /**
     * Handle job application
     */
    async applyToJob(req, res) {
        const jobId = req.params.jobId;
        const seekerId = req.user.id;
        // In a real app, we'd use the resume from seeker_details
        const { resume_path } = req.body;

        try {
            // Check if seeker has a profile
            const profile = await Seeker.getDetailsByUserId(seekerId);
            if (!profile) {
                return res.status(403).json({ success: false, message: 'Please complete your profile first.' });
            }

            // Simple match score for demo
            const matchScore = Math.floor(Math.random() * 41) + 60; // 60-100

            await Application.create({
                job_id: jobId,
                seeker_id: seekerId,
                resume_path: profile.resume_filename || 'UploadedResume.pdf',
                match_score: matchScore
            });

            res.json({ success: true, message: 'Applied successfully!', match_score: matchScore });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'Error applying for job' });
        }
    },

    /**
     * Get seeker's own applications
     */
    async getMyApplications(req, res) {
        try {
            const applications = await Application.getBySeeker(req.user.id);
            res.json(applications);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Error fetching your applications' });
        }
    },

    /**
     * Submit Profile (Step 2)
     */
    async submitProfile(req, res) {
        const { phone_number, bio, education, experience_years, skills } = req.body;
        const userId = req.user.id;
        const resume = req.file;

        if (!resume) {
            return res.status(400).json({ success: false, message: 'Resume upload is required.' });
        }

        try {
            await Seeker.createOrUpdateDetails({
                user_id: userId,
                phone_number,
                bio,
                education,
                experience_years,
                skills,
                resume_data: resume.buffer,
                resume_mimetype: resume.mimetype,
                resume_filename: resume.originalname
            });

            res.json({ success: true, message: 'Profile completed successfully!', redirectTo: '/seeker/dashboard' });
        } catch (err) {
            console.error('Error saving seeker details:', err);
            res.status(500).json({ success: false, message: 'Database error while saving profile.' });
        }
    }
};

module.exports = seekerController;
