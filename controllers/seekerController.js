const Job = require('../models/jobModel');
const Application = require('../models/applicationModel');
const Seeker = require('../models/seekerModel');
const path = require('path');
const fs = require('fs');

const seekerController = {
    /**
     * Get all open jobs for seekers
     */
    async getJobs(req, res) {
        try {
            const jobs = await Job.getAllOpen();
            res.json(jobs);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Error fetching jobs' });
        }
    },

    /**
     * Handle job application
     */
    async applyToJob(req, res) {
        const jobId = req.params.jobId;
        const seekerId = req.user.id;
        
        try {
            // Check if seeker has a profile
            const profile = await Seeker.getFullProfile(seekerId);
            if (!profile) {
                return res.status(403).json({ success: false, message: 'Please complete your profile first.' });
            }

            // Simple match score for demo
            const matchScore = Math.floor(Math.random() * 41) + 60; // 60-100

            await Application.create({
                job_id: jobId,
                seeker_id: seekerId,
                resume_path: profile.resume_path || 'UploadedResume.pdf',
                match_score: matchScore
            });

            res.json({ success: true, message: 'Applied successfully!', match_score: matchScore });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'Error applying for job' });
        }
    },

    /**
     * Get seeker's own applications
     */
    async getMyApplications(req, res) {
        try {
            const applications = await Application.getBySeeker(req.user.id);
            res.json(applications);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Error fetching your applications' });
        }
    },

    /**
     * Submit Profile (Complex Multi-section)
     */
    async submitProfile(req, res) {
        try {
            const userId = req.user.id;
            // With upload.fields(), files are in req.files
            const resumeFile = req.files && req.files['resume'] ? req.files['resume'][0] : null;
            const certFiles = req.files && req.files['cert_files'] ? req.files['cert_files'] : [];

            const body = req.body;
            
            const parseJson = (field) => {
                if (!body[field]) return [];
                try {
                    return typeof body[field] === 'string' ? JSON.parse(body[field]) : body[field];
                } catch (e) {
                    console.error(`Error parsing ${field}:`, e);
                    return [];
                }
            };

            // Map cert files to certifications using fileIndex
            let certifications = parseJson('certifications');
            certFiles.forEach(file => {
                const idx = parseInt(file.fieldname_index || file.originalname.split('__idx__')[1]) || 0;
                // We use a simpler approach: cert_files are ordered by their certIndex appended in originalname
                // The client sends files with originalname pattern: cert_<index>__<original_name>
                const match = file.originalname.match(/^cert_(\d+)__/);
                if (match) {
                    const certIndex = parseInt(match[1]);
                    if (certifications[certIndex]) {
                        certifications[certIndex].certificate_path = file.originalname;
                    }
                }
            });

            const profileData = {
                user_id: userId,
                full_name: body.full_name,
                email: body.email,
                phone: body.phone,
                location: body.location,
                current_job_title: body.current_job_title,
                current_company: body.current_company,
                total_experience_years: parseInt(body.total_experience_years) || 0,
                total_experience_months: parseInt(body.total_experience_months) || 0,
                industry: body.industry,
                functional_area: body.functional_area,
                profile_summary: body.profile_summary,
                preferred_location: body.preferred_location,
                expected_salary: body.expected_salary,
                job_type: body.job_type || 'Full-time',
                desired_role: body.desired_role,
                preferred_industry: body.preferred_industry,
                shift_preference: body.shift_preference || 'Flexible',
                actively_looking: body.actively_looking === 'true' || body.actively_looking === true,
                profile_visibility: body.profile_visibility || 'Public',
                
                education: parseJson('education'),
                experience: parseJson('experience'),
                skills: parseJson('skills'),
                projects: parseJson('projects'),
                languages: parseJson('languages'),
                certifications: certifications
            };

            if (resumeFile) {
                profileData.resume_path = resumeFile.originalname;
            }

            await Seeker.createOrUpdateDetails(profileData);

            res.json({ 
                success: true, 
                message: 'Profile updated successfully!', 
                redirectTo: '/seeker/dashboard' 
            });
        } catch (err) {
            console.error('Error in submitProfile:', err);
            res.status(500).json({ success: false, message: 'Server error while saving profile.' });
        }
    },

    /**
     * Get Full Profile API
     */
    async getProfile(req, res) {
        try {
            const profile = await Seeker.getFullProfile(req.user.id);
            if (!profile) {
                return res.status(404).json({ success: false, message: 'Profile not found' });
            }
            res.json({ success: true, profile });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'Error fetching profile' });
        }
    },

    /**
     * Render Profile Setup Page
     */
    async renderProfileSetup(req, res) {
        try {
            const profile = await Seeker.getFullProfile(req.user.id);
            res.render('seeker-profile-setup', { 
                title: 'Professional Profile Setup',
                user: req.user,
                profile: profile || {}
            });
        } catch (err) {
            console.error(err);
            res.status(500).send('Error loading profile setup page');
        }
    },

    /**
     * Get a certification document by cert ID
     * Accessible by recruiters via link in profile modal
     */
    async getCertDocument(req, res) {
        try {
            const cert = await Seeker.getCertById(req.params.certId);
            if (!cert || !cert.certificate_path) {
                return res.status(404).json({ success: false, message: 'Certificate document not found.' });
            }
            // Since we store the original filename (in-memory, no disk save in this demo),
            // return the stored filename as metadata for the recruiter
            res.json({ success: true, filename: cert.certificate_path, certification_name: cert.certification_name });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'Error fetching certificate.' });
        }
    }
};

module.exports = seekerController;

