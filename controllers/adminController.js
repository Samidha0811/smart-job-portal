const Recruiter = require('../models/recruiterModel');
const User = require('../models/userModel');

const adminController = {
    /**
     * Get Admin Dashboard with pending recruiters
     */
    async getDashboard(req, res) {
        try {
            const pendingRecruiters = await Recruiter.getPending();
            res.render('admin', { title: 'Admin Dashboard', recruiters: pendingRecruiters });
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
            await User.updateStatus(userId, 'approved');
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
            await User.updateStatus(userId, 'rejected');
            res.redirect('/admin');
        } catch (err) {
            console.error(err);
            res.status(500).send('Error rejecting user');
        }
    }
};

module.exports = adminController;
