const db = require('../config/db');

const Recruiter = {
    /**
     * Create recruiter registration details
     */
    async createDetails(detailsData) {
        const {
            user_id, company_name, company_email, company_website, company_description,
            industry, address_line, city, state, country, pincode,
            full_name, contact_number, designation, registration_cert_no, registration_cert_url,
            gst_number, gst_doc_url, pan_number, pan_doc_url,
            company_size, linkedin_profile, years_in_business
        } = detailsData;

        return await db.query(
            `INSERT INTO recruiter_details (
                user_id, company_name, company_email, company_website, company_description,
                industry, address_line, city, state, country, pincode,
                full_name, contact_number, designation, registration_cert_no, registration_cert_url,
                gst_number, gst_doc_url, pan_number, pan_doc_url,
                company_size, linkedin_profile, years_in_business, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
            [
                user_id, company_name, company_email, company_website, company_description,
                industry, address_line, city, state, country, pincode,
                full_name, contact_number, designation, registration_cert_no, registration_cert_url,
                gst_number, gst_doc_url, pan_number, pan_doc_url,
                company_size, linkedin_profile, years_in_business
            ]
        );
    },

    /**
     * Find recruiter by user ID
     */
    async findByUserId(userId) {
        const [rows] = await db.query('SELECT * FROM recruiter_details WHERE user_id = ?', [userId]);
        return rows[0];
    },

    /**
     * Get pending recruiters for admin
     */
    async getPending() {
        const [rows] = await db.query(`
            SELECT u.id, u.fullname, u.email, u.status, rd.company_name, rd.created_at as submitted_at
            FROM users u
            LEFT JOIN recruiter_details rd ON u.id = rd.user_id
            WHERE u.role = "recruiter" AND u.status = "pending"
            ORDER BY rd.created_at DESC
        `);
        return rows;
    },

    /**
     * Get full recruiter profile for admin review
     */
    async getFullProfile(userId) {
        const [rows] = await db.query(`
            SELECT u.*, rd.* 
            FROM users u
            JOIN recruiter_details rd ON u.id = rd.user_id
            WHERE u.id = ?
        `, [userId]);
        return rows[0];
    }
};

module.exports = Recruiter;
