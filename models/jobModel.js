const db = require('../config/db');

const Job = {
    /**
     * Create a new job
     */
    async create(jobData) {
        const { recruiter_id, title, description, keywords, location, salary, experience_required } = jobData;
        
        // Generate a unique human-readable job ID (e.g., JOB-1A2B3C)
        const jobId = 'JOB-' + Math.random().toString(36).substring(2, 8).toUpperCase();

        return await db.query(
            'INSERT INTO jobs (job_id, recruiter_id, title, description, keywords, location, salary, experience_required) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [jobId, recruiter_id, title, description, keywords, location, salary, experience_required || 0]
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
            WHERE j.status = "open" AND rd.status = "approved"
            ORDER BY j.created_at DESC
        `);
        // Note: The above logic for rd.status might need refinement based on how recruiter status is stored.
        // Actually, looking at recruiterModel, it has a status 'approved'.
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
    },

    /**
     * Get a specific job by its primary ID
     */
    async getById(id) {
        const [rows] = await db.query(`
            SELECT j.*, rd.company_name, rd.company_description 
            FROM jobs j
            LEFT JOIN recruiter_details rd ON j.recruiter_id = rd.user_id
            WHERE j.id = ?
        `, [id]);
        return rows[0];
    },

    /**
     * Delete a job by ID (ensuring recruiter ownership)
     */
    async delete(id, recruiterId) {
        return await db.query(
            'DELETE FROM jobs WHERE id = ? AND recruiter_id = ?',
            [id, recruiterId]
        );
    }
};

module.exports = Job;
