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
            const seekerId = req.user.id;

            // Fetch seeker's applications to mark already applied jobs
            const myApps = await Application.getBySeeker(seekerId);
            const appliedJobIds = new Set(myApps.map(app => app.job_id));

            const jobsWithStatus = jobs.map(job => ({
                ...job,
                isApplied: appliedJobIds.has(job.id)
            }));

            res.json(jobsWithStatus);
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

            // Check if already applied
            const existing = await Application.findByJobAndSeeker(jobId, seekerId);
            if (existing) {
                return res.status(400).json({ success: false, message: 'You have already applied for this job.' });
            }

            // Simple match score for demo
            const matchScore = Math.floor(Math.random() * 41) + 60; // 60-100

            await Application.create({
                job_id: jobId,
                seeker_id: seekerId,
                resume_path: profile.resume_path || 'UploadedResume.pdf',
                match_score: matchScore
            });

            res.json({ 
                success: true, 
                message: 'Applied successfully!', 
                match_score: matchScore,
                redirectTo: `/seeker/interview-prep/${jobId}`
            });
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
    },

    /**
     * Recommendation System Logic: GET /api/recommendations
     */
    async getRecommendations(req, res) {
        const seekerId = req.user.id;
        try {
            // 1. Fetch seeker's profile
            const profile = await Seeker.getFullProfile(seekerId);
            if (!profile) {
                return res.json([]); // Return empty if no profile setup
            }

            // 2. Fetch seeker's applied jobs to build interest profile
            const appliedApps = await Application.getBySeeker(seekerId);
            const appliedJobIds = new Set(appliedApps.map(a => a.job_id));

            // Extract skills from profile
            const userSkills = profile.skills.map(s => s.skill_name.toLowerCase());
            
            // Build keyword frequency map from profile and applied jobs
            const interestProfile = {};
            userSkills.forEach(s => interestProfile[s] = (interestProfile[s] || 0) + 5); // Profile skills have high weight

            // Add keywords from applied jobs
            appliedApps.forEach(app => {
                if (app.keywords) {
                    const kws = app.keywords.split(',').map(k => k.trim().toLowerCase());
                    kws.forEach(kw => {
                        interestProfile[kw] = (interestProfile[kw] || 0) + 2; // Keywords from applied jobs have moderate weight
                    });
                }
                // Optional: Extract from title too
                const titleWords = app.job_title.toLowerCase().split(/\s+/);
                titleWords.forEach(w => {
                    if (w.length > 3) interestProfile[w] = (interestProfile[w] || 0) + 1;
                });
            });

            // 3. Fetch all open candidate jobs from verified recruiters
            const allJobs = await Job.getAllOpen();
            const candidates = allJobs.filter(j => !appliedJobIds.has(j.id));

            // 4. Score each candidate
            const recommended = candidates.map(job => {
                let score = 0;
                let matchedSkills = [];
                
                const jobKeywords = job.keywords ? job.keywords.split(',').map(k => k.trim().toLowerCase()) : [];
                const jobTitle = job.title.toLowerCase();
                const jobDesc = job.description.toLowerCase();

                // Skill Match Scoring
                jobKeywords.forEach(kw => {
                    if (interestProfile[kw]) {
                        score += 2;
                        matchedSkills.push(kw);
                    } else {
                        // Check partial matches
                        for (let profSkill in interestProfile) {
                            if (kw.includes(profSkill) || profSkill.includes(kw)) {
                                score += 1;
                                if (!matchedSkills.includes(kw)) matchedSkills.push(kw);
                                break;
                            }
                        }
                    }
                });

                // Location Match (+1)
                if (profile.preferred_location && job.location) {
                    if (job.location.toLowerCase().includes(profile.preferred_location.toLowerCase())) {
                        score += 1;
                    }
                }

                // Experience Match (+1)
                const jobExp = job.experience_required || 0;
                const userExp = profile.total_experience_years || 0;
                if (userExp >= jobExp) {
                    score += 1;
                }

                // Normalize score to percentage (Max assumed 10 for demo)
                const matchPercentage = Math.min(Math.round((score / 10) * 100), 100);

                return {
                    job_id: job.id,
                    title: job.title,
                    company: job.company_name,
                    location: job.location,
                    match_score: matchPercentage,
                    matched_skills: matchedSkills.slice(0, 5), // Return top 5 matched
                    salary: job.salary
                };
            });

            // 5. Rank and return top 10
            const topRecommendations = recommended
                .filter(r => r.match_score > 0)
                .sort((a, b) => b.match_score - a.match_score)
                .slice(0, 10);

            res.json(topRecommendations);
        } catch (err) {
            console.error('Error in getRecommendations:', err);
            res.status(500).json({ message: 'Error fetching recommendations' });
        }
    },

    /**
     * Render Interview Prep Page
     */
    async renderInterviewPrep(req, res) {
        try {
            const jobId = req.params.jobId;
            const job = await Job.getById(jobId);
            if (!job) {
                return res.status(404).send('Job not found');
            }

            res.render('seeker-interview-prep', {
                title: 'Interview Preparation',
                user: req.user,
                job: job
            });
        } catch (err) {
            console.error(err);
            res.status(500).send('Error loading interview preparation page');
        }
    },

    /**
     * API to generate/fetch interview prep content (AI powered with fallback)
     */
    async getInterviewPrepData(req, res) {
        const jobId = req.params.jobId;
        try {
            const job = await Job.getById(jobId);
            if (!job) {
                return res.status(404).json({ success: false, message: 'Job not found' });
            }

            const role = job.title;
            const company = job.company_name;
            const skills = job.keywords || 'general skills';

            // Approach 1 (Fallback Content)
            const fallbackContent = {
                technical: [
                    `Can you explain your experience with ${skills}?`,
                    `What is the most complex project you handled related to ${role}?`,
                    `How do you stay updated with the latest trends in ${skills}?`,
                    `Describe a scenario where you solved a difficult problem using ${skills}.`,
                    `What are the best practices you follow for ${role} tasks?`
                ],
                hr: [
                    `Tell me about yourself and your background.`,
                    `Where do you see yourself in 5 years?`,
                    `Describe a time when you overcame a challenge at work.`
                ],
                company: [
                    `Why do you want to join ${company}?`,
                    `What do you know about ${company}'s products or services?`
                ],
                tips: [
                    `Research ${company} thoroughly before the interview.`,
                    `Practice explaining your projects that map to ${skills}.`,
                    `Be ready with examples using the STAR method (Situation, Task, Action, Result).`
                ]
            };

            // Attempt Approach 2 (AI Powered)
            if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
                const { GoogleGenerativeAI } = require('@google/generative-ai');
                const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

                const prompt = `Generate interview preparation content for:
Role: ${role}
Company: ${company}
Skills: ${skills}

Provide:
5 technical interview questions
3 HR questions
2 company-specific questions
Preparation tips to crack the interview

Return the response STRICTLY as a JSON object with the following keys:
{
  "technical": ["q1", "q2", "q3", "q4", "q5"],
  "hr": ["q1", "q2", "q3"],
  "company": ["q1", "q2"],
  "tips": ["tip1", "tip2", "tip3"]
}`;

                try {
                    const result = await model.generateContent(prompt);
                    const textResponse = result.response.text();
                    
                    // Basic cleanup to extract JSON if markdown wrapping is used
                    const jsonStrMatch = textResponse.match(/\{[\s\S]*\}/);
                    if (jsonStrMatch) {
                        const parsedContent = JSON.parse(jsonStrMatch[0]);
                        return res.json({ success: true, isAI: true, data: parsedContent });
                    }
                } catch (aiError) {
                    console.error("AI Generation failed, falling back to static content:", aiError);
                    // Fall through to fallback content response
                }
            }

            // Return fallback if AI failed or API key missing
            res.json({ success: true, isAI: false, data: fallbackContent });
            
        } catch (err) {
            console.error('Error fetching interview prep:', err);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    }
};

module.exports = seekerController;

