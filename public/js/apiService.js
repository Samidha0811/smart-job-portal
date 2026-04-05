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
    },
    /**
     * Get current logged-in user details
     */
    async getCurrentUser() {
        const response = await fetch('/api/auth/me');
        return await response.json();
    },

    /**
     * Create or update company profile (Auth handled by cookie)
     * @param {Object} profileData { bio, company_name, website }
     */
    async updateProfile(profileData) {
        const response = await fetch('/api/recruiter/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profileData)
        });
        return await response.json();
    },

    /**
     * Post a new job (Auth handled by cookie)
     * @param {Object} jobData { title, description, keywords, location, salary }
     */
    async postJob(jobData) {
        const response = await fetch('/api/recruiter/post-job', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(jobData)
        });
        return await response.json();
    },

    /**
     * Get jobs for the logged-in recruiter
     */
    async getMyJobs() {
        const response = await fetch('/api/recruiter/my-jobs');
        return await response.json();
    },

    /**
     * Get profile for the logged-in recruiter
     */
    async getMyProfile() {
        const response = await fetch('/api/recruiter/profile');
        return await response.json();
    },

    /**
     * Get applicants for a job
     * @param {number} jobId 
     */
    async getJobApplicants(jobId) {
        const response = await fetch(`/api/recruiter/applicants/${jobId}`);
        return await response.json();
    },

    /**
     * Delete a job listing (Recruiter)
     * @param {number} jobId 
     */
    async deleteJob(jobId) {
        const response = await fetch(`/api/recruiter/jobs/${jobId}`, {
            method: 'DELETE'
        });
        return await response.json();
    },

    /**
     * Update application status (Recruiter)
     * @param {number} applicationId 
     * @param {string} status 'shortlisted' | 'rejected' | 'pending'
     */
    async updateApplicationStatus(applicationId, status) {
        const response = await fetch(`/api/recruiter/applications/${applicationId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        return await response.json();
    },

    /**
     * Get all applications for recruiter's jobs
     */
    async getRecruiterApplications() {
        const response = await fetch('/api/recruiter/all-applications');
        return await response.json();
    },

    /**
     * Get all open jobs (Seeker/Public)
     */
    async getJobs() {
        const response = await fetch('/api/seeker/jobs');
        return await response.json();
    },

    /**
     * Complete seeker profile (Multer POST)
     * @param {FormData} formData 
     */
    async submitSeekerProfile(formData) {
        const response = await fetch('/api/seeker/complete-profile', {
            method: 'POST',
            body: formData
        });
        return await response.json();
    },

    /**
     * Apply to a job (Seeker)
     * @param {number} jobId 
     */
    async applyToJob(jobId) {
        const response = await fetch(`/api/seeker/apply/${jobId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}) // Backend uses the profile resume
        });
        return await response.json();
    },

    /**
     * Get seeker's own applications
     */
    async getMyApplications() {
        const response = await fetch('/api/seeker/my-applications');
        return await response.json();
    }
};

// Export to global scope for use in other scripts
window.apiService = apiService;
