const Recruiter = require('../models/recruiterModel');
const Job = require('../models/jobModel');
const Application = require('../models/applicationModel');
const Seeker = require('../models/seekerModel');
const User = require('../models/userModel');
const db = require('../config/db');

const recruiterController = {
    /**
     * Handle recruiter details submission (Step 2)
     */
    async registerDetails(req, res) {
        const {
            user_id, company_name, company_email, company_website, company_description,
            industry, address_line, city, state, country, pincode,
            full_name, contact_number, designation, registration_cert_no,
            gst_number, pan_number, company_size, linkedin_profile, years_in_business
        } = req.body;

        if (!user_id || !company_name || !company_email) {
            return res.status(400).json({ message: 'User ID, Company Name and Email are required.' });
        }

        const regCert = req.files['registration_cert'] ? req.files['registration_cert'][0] : null;
        const gstDoc = req.files['gst_doc'] ? req.files['gst_doc'][0] : null;
        const panDoc = req.files['pan_doc'] ? req.files['pan_doc'][0] : null;

        try {
            await Recruiter.createDetails({
                user_id, company_name, company_email, company_website, company_description,
                industry, address_line, city, state, country, pincode,
                full_name, contact_number, designation, registration_cert_no,
                registration_cert_data: regCert ? regCert.buffer : null,
                registration_cert_mimetype: regCert ? regCert.mimetype : null,
                registration_cert_filename: regCert ? regCert.originalname : null,
                gst_number,
                gst_doc_data: gstDoc ? gstDoc.buffer : null,
                gst_doc_mimetype: gstDoc ? gstDoc.mimetype : null,
                gst_doc_filename: gstDoc ? gstDoc.originalname : null,
                pan_number,
                pan_doc_data: panDoc ? panDoc.buffer : null,
                pan_doc_mimetype: panDoc ? panDoc.mimetype : null,
                pan_doc_filename: panDoc ? panDoc.originalname : null,
                company_size, linkedin_profile, years_in_business
            });
            await User.updateStatus(user_id, 'pending');
            res.json({ success: true, message: 'Recruiter details submitted! Please wait for Admin approval.' });
        } catch (err) {
            console.error('Error saving recruiter details:', err);
            res.status(500).json({ success: false, message: 'Database error while saving details.' });
        }
    },

    /**
     * Serve document from database
     */
    async serveDocument(req, res) {
        const { type, userId } = req.params;
        const allowedTypes = ['registration_cert', 'gst_doc', 'pan_doc'];
        if (!allowedTypes.includes(type)) return res.status(400).send('Invalid document type');

        try {
            const [rows] = await db.query(
                `SELECT ${type}_data as data, ${type}_mimetype as mimetype, ${type}_filename as filename 
                 FROM recruiter_details WHERE user_id = ?`, [userId]
            );
            if (rows.length === 0 || !rows[0].data) return res.status(404).send('Document not found');
            const doc = rows[0];
            res.setHeader('Content-Type', doc.mimetype || 'application/octet-stream');
            res.setHeader('Content-Disposition', `inline; filename="${doc.filename || 'document'}"`);
            res.send(doc.data);
        } catch (err) {
            console.error('Error serving document:', err);
            res.status(500).send('Internal Server Error');
        }
    },

    /**
     * Serve Seeker Resume from database
     */
    async serveResume(req, res) {
        const { seekerId } = req.params;
        try {
            const [rows] = await db.query(
                `SELECT resume_data as data, resume_mimetype as mimetype, resume_filename as filename 
                 FROM seeker_details WHERE user_id = ?`, [seekerId]
            );
            if (rows.length === 0 || !rows[0].data) return res.status(404).send('Resume not found');
            const doc = rows[0];
            res.setHeader('Content-Type', doc.mimetype || 'application/pdf');
            res.setHeader('Content-Disposition', `inline; filename="${doc.filename || 'resume.pdf'}"`);
            res.send(doc.data);
        } catch (err) {
            console.error('Error serving resume:', err);
            res.status(500).send('Internal Server Error');
        }
    },

    /**
     * Create/Update Company Profile
     */
    async updateProfile(req, res) {
        const userId = req.user.id;
        const { bio, company_name, website } = req.body;
        try {
            const [existing] = await db.query('SELECT * FROM profiles WHERE user_id = ?', [userId]);
            if (existing.length > 0) {
                await db.query('UPDATE profiles SET bio = ?, company_name = ?, website = ? WHERE user_id = ?', [bio, company_name, website, userId]);
            } else {
                await db.query('INSERT INTO profiles (user_id, bio, company_name, website) VALUES (?, ?, ?, ?)', [userId, bio, company_name, website]);
            }
            res.json({ success: true, message: 'Profile updated successfully!' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'Error updating profile' });
        }
    },

    /**
     * Post a New Job
     */
    async postJob(req, res) {
        const recruiterId = req.user.id;
        const { title, description, keywords, location, salary } = req.body;
        try {
            const user = await User.findById(recruiterId);
            if (!user || user.status !== 'approved') return res.status(403).json({ success: false, message: 'Your account must be approved by an Admin to post jobs.' });
            
            const [profileRows] = await db.query('SELECT id FROM profiles WHERE user_id = ?', [recruiterId]);
            if (profileRows.length === 0) {
                return res.status(403).json({ success: false, message: 'Please save your Company Profile for Seeker view before posting a job.' });
            }

            await Job.create({ recruiter_id: recruiterId, title, description, keywords, location, salary });
            res.json({ success: true, message: 'Job posted successfully!' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'Error posting job' });
        }
    },

    /**
     * Get recruiter's own profile
     */
    async getMyProfile(req, res) {
        try {
            const [profileRows] = await db.query('SELECT * FROM profiles WHERE user_id = ?', [req.user.id]);
            if (profileRows.length > 0) {
                const profile = profileRows[0];
                profile.profile_exists = true;
                return res.json(profile);
            }
            const [recruiterRows] = await db.query(
                `SELECT company_name, company_website as website, company_description as bio, industry, address_line, city, state, country, pincode, contact_number, designation, company_size, linkedin_profile, years_in_business
                FROM recruiter_details WHERE user_id = ?`, [req.user.id]
            );
            const recruiter = recruiterRows[0] || {};
            recruiter.profile_exists = false;
            res.json(recruiter);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },

    /**
     * Get jobs posted by recruiter
     */
    async getMyJobs(req, res) {
        try {
            const jobs = await Job.getByRecruiter(req.user.id);
            res.json(jobs);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Error fetching jobs' });
        }
    },

    /**
     * Get applicants for a specific job
     */
    async getJobApplicants(req, res) {
        try {
            const applicants = await Application.getByJob(req.params.jobId);
            res.json(applicants);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Error fetching applicants' });
        }
    },

    /**
     * Update application status
     */
    async updateApplicationStatus(req, res) {
        const { status } = req.body;
        const applicationId = req.params.applicationId;
        const allowedStatuses = ['pending', 'shortlisted', 'rejected', 'hold', 'under process'];
        if (!allowedStatuses.includes(status)) return res.status(400).json({ success: false, message: 'Invalid status' });
        try {
            const app = await Application.findByIdAndRecruiter(applicationId, req.user.id);
            if (!app) return res.status(403).json({ success: false, message: 'Unauthorized to update this application' });
            await Application.updateStatus(applicationId, status);
            res.json({ success: true, message: `Application marked as ${status}!` });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'Error updating application status' });
        }
    },

    /**
     * Get all applications for jobs by this recruiter
     */
    async getAllApplications(req, res) {
        try {
            const applications = await Application.getByRecruiter(req.user.id);
            res.json(applications);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Error fetching applications' });
        }
    },

    /**
     * Get a specific seeker's full profile (if they applied)
     */
    async getSeekerProfile(req, res) {
        const seekerId = req.params.seekerId;
        const recruiterId = req.user.id;
        try {
            const [application] = await db.query(
                `SELECT a.id FROM applications a JOIN jobs j ON a.job_id = j.id WHERE a.seeker_id = ? AND j.recruiter_id = ?`,
                [seekerId, recruiterId]
            );
            if (application.length === 0) return res.status(403).json({ success: false, message: 'Access denied: Applicant has not applied to your jobs.' });
            const profile = await Seeker.getFullProfile(seekerId);
            if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });
            res.json({ success: true, profile });
        } catch (err) {
            console.error('Error fetching seeker profile:', err);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    }
};

module.exports = recruiterController;
