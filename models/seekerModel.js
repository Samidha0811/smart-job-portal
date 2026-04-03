const db = require('../config/db');

const Seeker = {
    /**
     * Create or update seeker details
     */
    async createOrUpdateDetails(details) {
        const {
            user_id, phone_number, bio, education, experience_years, skills,
            resume_data, resume_mimetype, resume_filename
        } = details;

        const [existing] = await db.query('SELECT id FROM seeker_details WHERE user_id = ?', [user_id]);

        if (existing.length > 0) {
            return await db.query(
                `UPDATE seeker_details SET 
                    phone_number = ?, bio = ?, education = ?, experience_years = ?, skills = ?, 
                    resume_data = ?, resume_mimetype = ?, resume_filename = ? 
                 WHERE user_id = ?`,
                [phone_number, bio, education, experience_years, skills, resume_data, resume_mimetype, resume_filename, user_id]
            );
        } else {
            return await db.query(
                `INSERT INTO seeker_details 
                    (user_id, phone_number, bio, education, experience_years, skills, resume_data, resume_mimetype, resume_filename) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [user_id, phone_number, bio, education, experience_years, skills, resume_data, resume_mimetype, resume_filename]
            );
        }
    },

    /**
     * Get seeker details by user ID
     */
    async getDetailsByUserId(userId) {
        const [rows] = await db.query('SELECT * FROM seeker_details WHERE user_id = ?', [userId]);
        return rows[0];
    }
};

module.exports = Seeker;
