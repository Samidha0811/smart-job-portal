const Recruiter = require('../models/recruiterModel');
const User = require('../models/userModel');
const sendMail = require('../utils/sendMail');

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
        const userId = req.params.userId || req.body.userId;
        try {
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            // Update Status in both tables
            await User.updateStatus(userId, 'approved');
            await User.updateVerificationStatus(userId, 1); // 1 = Approved
            await Recruiter.updateStatus(userId, 'approved');

            // Send Approval Email
            try {
                await sendMail(
                    user.email,
                    'Profile Approved',
                    `
                    <p>Hello <strong>${user.fullname}</strong>,</p>
                    <p>Congratulations! Your recruiter profile has been <strong>approved</strong>.</p>
                    <p>You can now login to your dashboard and start posting jobs to find the best talent.</p>
                    <br>
                    <a href="${process.env.APP_URL || ''}/login" style="background:#4a90e2;color:#fff;padding:10px 20px;text-decoration:none;border-radius:5px;display:inline-block;">Login to Dashboard</a>
                    <br><br>
                    <p>Best Regards,<br>Smart Job Portal Team</p>
                    `
                );
            } catch (emailErr) {
                console.error('Approval email failed:', emailErr.message);
            }

            return res.json({ success: true, message: 'Recruiter approved successfully!' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'Error approving recruiter' });
        }
    },

    /**
     * Reject recruiter
     */
    async rejectRecruiter(req, res) {
        const userId = req.params.userId || req.body.userId;
        try {
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            // Update Status in both tables
            await User.updateStatus(userId, 'rejected');
            await User.updateVerificationStatus(userId, 2); // 2 = Rejected
            await Recruiter.updateStatus(userId, 'rejected');

            // Send Rejection Email
            try {
                await sendMail(
                    user.email,
                    'Profile Rejected',
                    `
                    <p>Hello <strong>${user.fullname}</strong>,</p>
                    <p>We regret to inform you that your recruiter profile was not approved at this time.</p>
                    <p>Please ensure all your documents are correct and contact our support team for further clarification.</p>
                    <p>Message: <strong>Your profile was not approved. Please contact support.</strong></p>
                    <br>
                    <p>Best Regards,<br>Smart Job Portal Team</p>
                    `
                );
            } catch (emailErr) {
                console.error('Rejection email failed:', emailErr.message);
            }

            return res.json({ success: true, message: 'Recruiter rejected successfully!' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'Error rejecting recruiter' });
        }
    }
};

module.exports = adminController;
