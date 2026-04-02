const Job = require('../models/jobModel');
const Application = require('../models/applicationModel');

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
        const { resume_path } = req.body;

        try {
            // Simple match score for demo
            const matchScore = Math.floor(Math.random() * 41) + 60; // 60-100

            await Application.create({
                job_id: jobId,
                seeker_id: seekerId,
                resume_path,
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
    }
};

module.exports = seekerController;
