const db = require('../config/db');

const Job = {
    /**
     * Create a new job
     */
    async create(jobData) {
        const { recruiter_id, title, description, keywords, location, salary } = jobData;
        return await db.query(
            'INSERT INTO jobs (recruiter_id, title, description, keywords, location, salary) VALUES (?, ?, ?, ?, ?, ?)',
            [recruiter_id, title, description, keywords, location, salary]
        );
    },

    /**
     * Get all open jobs
     */
    async getAllOpen() {
        const [rows] = await db.query('SELECT * FROM jobs WHERE status = "open" ORDER BY created_at DESC');
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
