const db = require('../config/db');

const Job = {
    /**
     * Create a new job
     */
    async create(jobData) {
        const { recruiter_id, title, description, keywords, location, salary } = jobData;
        
        // Generate a unique human-readable job ID (e.g., JOB-1A2B3C)
        const jobId = 'JOB-' + Math.random().toString(36).substring(2, 8).toUpperCase();

        return await db.query(
            'INSERT INTO jobs (job_id, recruiter_id, title, description, keywords, location, salary) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [jobId, recruiter_id, title, description, keywords, location, salary]
        );
    },

    /**
     * Get all open jobs
     */
    async getAllOpen() {
        const [rows] = await db.query(`
            SELECT j.*, rd.company_name, rd.company_description 
            FROM jobs j
            JOIN recruiter_details rd ON j.recruiter_id = rd.user_id
            WHERE j.status = "open" 
            ORDER BY j.created_at DESC
        `);
        return rows;
    },

    /**
     * Get jobs by recruiter
     */
    async getByRecruiter(recruiterId) {
        const [rows] = await db.query(
            'SELECT * FROM jobs WHERE recruiter_id = ? ORDER BY created_at DESC',
            [recruiterId]
        );
        return rows;
    }
};

module.exports = Job;
