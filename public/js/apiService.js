const apiService = {
    /**
     * Helper to make POST requests with URLSearchParams
     * @param {string} url 
     * @param {Object} data 
     * @returns {Promise<Response>}
     */
    async post(url, data) {
        const body = new URLSearchParams(data);
        return await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: body.toString()
        });
    },

    /**
     * User registration
     * @param {Object} userData { username, email, password, role }
     */
    async register(userData) {
        const response = await this.post('/api/auth/register', userData);
        return response;
    },

    /**
     * User login
     * @param {Object} credentials { email, password }
     */
    async login(credentials) {
        const response = await this.post('/api/auth/login', credentials);
        return response;
    },

    /**
     * Approve a recruiter
     * @param {number} userId 
     */
    async approveRecruiter(userId) {
        const response = await this.post('/api/admin/approve', { userId });
        return response;
    },

    /**
     * Reject a recruiter
     * @param {number} userId 
     */
    async rejectRecruiter(userId) {
        const response = await this.post('/api/admin/reject', { userId });
        return response;
    }
};

// Export to global scope for use in other scripts
window.apiService = apiService;
