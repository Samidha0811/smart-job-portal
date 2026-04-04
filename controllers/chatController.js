const { GoogleGenerativeAI } = require('@google/generative-ai');
const Seeker = require('../models/seekerModel');
const Application = require('../models/applicationModel');
const Job = require('../models/jobModel');

const chatController = {
    async chat(req, res) {
        try {
            const seekerId = req.user.id;
            const { message, history } = req.body;

            if (!message) {
                return res.status(400).json({ success: false, message: 'Message is required' });
            }

            if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
                return res.status(500).json({ 
                    success: false, 
                    message: 'Gemini API key is missing. Please add GEMINI_API_KEY to your .env file.' 
                });
            }

            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

            // 1. Fetch User Profile
            const profile = await Seeker.getFullProfile(seekerId);
            let profileDetails = "No profile data available.";
            if (profile) {
                const skills = profile.skills ? profile.skills.map(s => s.skill_name).join(', ') : 'None listed';
                const experience = profile.total_experience_years + ' years';
                profileDetails = `
- Name: ${profile.full_name}
- Skills: ${skills}
- Experience: ${experience}
- Current Job Title: ${profile.current_job_title || 'N/A'}
- Desired Role: ${profile.desired_role || 'N/A'}
- Expected Salary: ${profile.expected_salary || 'N/A'}
- Profile Summary: ${profile.profile_summary || 'N/A'}
                `.trim();
            }

            // 2. Fetch User Applied Jobs
            const appliedApps = await Application.getBySeeker(seekerId);
            let appliedJobsContext = "No applied jobs yet.";
            if (appliedApps && appliedApps.length > 0) {
                appliedJobsContext = appliedApps.map(a => `- ${a.job_title} (Match Score: ${a.match_score}%)`).join('\n');
            }

            // 3. Fetch Available Jobs Snippet (Top 5 recent or matching)
            const allJobs = await Job.getAllOpen();
            let availableJobsContext = "No open jobs currently.";
            if (allJobs && allJobs.length > 0) {
                availableJobsContext = allJobs.slice(0, 5).map(j => `- ${j.title} at ${j.company_name} (Skills needed: ${j.keywords || 'N/A'})`).join('\n');
            }

            // 4. Construct Prompt
            const systemPrompt = `You are an expert AI Career Mentor for a smart job portal. Your goal is to guide the user with their career, resume, and job search.

User Profile:
${profileDetails}

User Applied Jobs:
${appliedJobsContext}

Current Available Jobs (Sample):
${availableJobsContext}

Guidelines for your response:
1. Be encouraging, professional, and concise.
2. Structure your response clearly using markdown formatting (bullet points, bold text).
3. Directly answer the user's question using their profile data.
4. If they ask about skill gaps, compare their profile skills to the skills needed in the "Current Available Jobs" or their "Desired Role".
5. Provide actionable next steps.
`;

            const model = genAI.getGenerativeModel({ 
                model: "gemini-2.5-flash",
                systemInstruction: systemPrompt
            });

            // Prepare history for Gemini
            let chatHistory = [];
            if (history && Array.isArray(history)) {
                chatHistory = history.slice(-6).map(msg => ({
                    role: msg.role === 'bot' ? 'model' : 'user',
                    parts: [{ text: msg.content }]
                }));
            }

            const chatSession = model.startChat({
                history: chatHistory,
                generationConfig: {
                    maxOutputTokens: 500,
                    temperature: 0.7,
                }
            });

            const result = await chatSession.sendMessage(message);
            const reply = result.response.text();

            res.json({ success: true, reply });

        } catch (error) {
            console.error("Gemini Chat Error:", error);
            res.status(500).json({ success: false, message: `Gemini Error: ${error.message}` });
        }
    }
};

module.exports = chatController;
