const db = require('../config/db');

const User = {
    /**
     * Create a new user
     */
    async create(userData) {
        const { fullname, email, password, role, status } = userData;
        const [result] = await db.query(
            'INSERT INTO users (fullname, email, password, role, status) VALUES (?, ?, ?, ?, ?)',
            [fullname, email, password, role, status]
        );
        return result.insertId;
    },

    /**
     * Find user by email
     */
    async findByEmail(email) {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    },

    /**
     * Find user by ID
     */
    async findById(id) {
        const [rows] = await db.query('SELECT id, fullname, email, role, status FROM users WHERE id = ?', [id]);
        return rows[0];
    },

    /**
     * Update user status
     */
    async updateStatus(userId, status) {
        return await db.query('UPDATE users SET status = ? WHERE id = ?', [status, userId]);
    }
};

module.exports = User;
