const db = require('../config/db');

const Application = {
    /**
     * Create a new application
     */
    async create(applicationData) {
        const { job_id, seeker_id, resume_path, match_score } = applicationData;
        return await db.query(
            'INSERT INTO applications (job_id, seeker_id, resume_path, match_score) VALUES (?, ?, ?, ?)',
            [job_id, seeker_id, resume_path, match_score]
        );
    },

    /**
     * Get applications for a recruiter's job
     */
    async getByRecruiter(recruiterId) {
        const [rows] = await db.query(
            `SELECT a.*, u.fullname as seeker_name, u.email as seeker_email, j.title as job_title, 
                    sd.phone_number, sd.bio, sd.education, sd.experience_years, sd.skills, sd.resume_filename 
             FROM applications a 
             JOIN users u ON a.seeker_id = u.id 
             JOIN jobs j ON a.job_id = j.id 
             LEFT JOIN seeker_details sd ON u.id = sd.user_id
             WHERE j.recruiter_id = ? 
             ORDER BY a.applied_at DESC`,
            [recruiterId]
        );
        return rows;
    },

    /**
     * Get applications for a specific job
     */
    async getByJob(jobId) {
        const [rows] = await db.query(
            `SELECT a.*, u.fullname as seeker_name, u.email as seeker_email, 
                    sd.phone_number, sd.bio, sd.education, sd.experience_years, sd.skills, sd.resume_filename 
             FROM applications a 
             JOIN users u ON a.seeker_id = u.id 
             LEFT JOIN seeker_details sd ON u.id = sd.user_id
             WHERE a.job_id = ?`,
            [jobId]
        );
        return rows;
    },

    /**
     * Get applications by seeker
     */
    async getBySeeker(seekerId) {
        const [rows] = await db.query(
            `SELECT a.*, j.title as job_title, j.description as job_description, 
                    j.location, j.salary, j.keywords, rd.company_name 
             FROM applications a 
             JOIN jobs j ON a.job_id = j.id 
             JOIN recruiter_details rd ON j.recruiter_id = rd.user_id
             WHERE a.seeker_id = ? 
             ORDER BY a.applied_at DESC`,
            [seekerId]
        );
        return rows;
    },

    /**
     * Update application status
     */
    async updateStatus(applicationId, status) {
        return await db.query(
            'UPDATE applications SET status = ? WHERE id = ?',
            [status, applicationId]
        );
    },

    /**
     * Find application by ID and recruiter ID
     */
    async findByIdAndRecruiter(applicationId, recruiterId) {
        const [rows] = await db.query(
            `SELECT a.* FROM applications a 
             JOIN jobs j ON a.job_id = j.id 
             WHERE a.id = ? AND j.recruiter_id = ?`,
            [applicationId, recruiterId]
        );
        return rows[0];
    },

    /**
     * Find application by Job ID and Seeker ID (to prevent duplicates)
     */
    async findByJobAndSeeker(jobId, seekerId) {
        const [rows] = await db.query(
            'SELECT * FROM applications WHERE job_id = ? AND seeker_id = ?',
            [jobId, seekerId]
        );
        return rows[0];
    },

    /**
     * Get application details for email notification
     */
    async getDetailsForEmail(applicationId) {
        const [rows] = await db.query(
            `SELECT a.status, u.email as seeker_email, 
                    COALESCE(jsp.full_name, u.fullname, u.email) as seeker_name, 
                    j.title as job_title, rd.company_name 
             FROM applications a 
             JOIN users u ON a.seeker_id = u.id 
             JOIN jobs j ON a.job_id = j.id 
             JOIN recruiter_details rd ON j.recruiter_id = rd.user_id 
             LEFT JOIN job_seeker_profiles jsp ON u.id = jsp.user_id
             WHERE a.id = ?`,
            [applicationId]
        );
        return rows[0];
    }
};

module.exports = Application;
