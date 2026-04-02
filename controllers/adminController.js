const Recruiter = require('../models/recruiterModel');
const User = require('../models/userModel');

const adminController = {
    /**
     * Get Admin Dashboard with pending recruiters
     */
    async getDashboard(req, res) {
        try {
            const allRecruiters = await Recruiter.getAll();
            res.render('admin', { title: 'Admin Dashboard', recruiters: allRecruiters });
        } catch (err) {
            console.error(err);
            res.status(500).send('Error loading admin panel');
        }
    },

    /**
     * Review specific recruiter details
     */
    async getRecruiterDetails(req, res) {
        try {
            const recruiter = await Recruiter.getFullProfile(req.params.id);

            if (!recruiter) {
                return res.status(404).send('Recruiter not found');
            }

            res.render('admin-recruiter-review', { title: 'Review Recruiter', recruiter });
        } catch (err) {
            console.error(err);
            res.status(500).send('Error loading recruiter details');
        }
    },

    /**
     * Approve recruiter
     */
    async approveRecruiter(req, res) {
        const { userId } = req.body;
        try {
            const user = await User.findById(userId);
            if (!user || user.status !== 'pending') {
                return res.status(400).send('Invalid request: Recruiter is not in pending status');
            }

            await User.updateStatus(userId, 'approved');
            await Recruiter.updateStatus(userId, 'approved');
            res.redirect('/admin');
        } catch (err) {
            console.error(err);
            res.status(500).send('Error approving user');
        }
    },

    /**
     * Reject recruiter
     */
    async rejectRecruiter(req, res) {
        const { userId } = req.body;
        try {
            const user = await User.findById(userId);
            if (!user || user.status !== 'pending') {
                return res.status(400).send('Invalid request: Recruiter is not in pending status');
            }

            await User.updateStatus(userId, 'rejected');
            await Recruiter.updateStatus(userId, 'rejected');
            res.redirect('/admin');
        } catch (err) {
            console.error(err);
            res.status(500).send('Error rejecting user');
        }
    }
};

module.exports = adminController;
