const express = require('express');
const router = express.Router();
const multer = require('multer');
const { PDFParse } = require('pdf-parse');
const path = require('path');

// Configure Multer for temporary storage
const storage = multer.memoryStorage();
const upload = multer({
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'), false);
        }
    },
    storage: storage
});

// Helper: Clean text
const cleanText = (text) => {
    return text.toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
};

// Helper: Extract keywords (simple version)
const extractKeywords = (text) => {
    const stopWords = new Set(['and', 'the', 'is', 'in', 'it', 'with', 'for', 'to', 'a', 'an', 'of', 'at', 'by', 'from', 'up', 'down', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now']);
    const words = cleanText(text).split(' ');
    return [...new Set(words.filter(word => word.length > 2 && !stopWords.has(word)))];
};

// Helper: Check sections
const checkSections = (text) => {
    const sections = {
        education: /education|academic|university|degree|college/i,
        experience: /experience|work history|employment|professional history/i,
        skills: /skills|technical skills|competencies|expertise/i,
        projects: /projects|personal projects|portfolio/i
    };
    
    const found = [];
    const missing = [];
    
    for (const [key, regex] of Object.entries(sections)) {
        if (regex.test(text)) {
            found.push(key);
        } else {
            missing.push(key);
        }
    }
    
    return { found, missing };
};

// Helper: Calculate Length Score (Ideal 300-800 words)
const lengthScore = (text) => {
    const wordCount = text.trim().split(/\s+/).length;
    if (wordCount >= 300 && wordCount <= 800) return 100;
    if (wordCount > 800) return 70; // Too long
    if (wordCount >= 150) return 50; // A bit short
    return 20; // Very short
};

// Route: Render ATS Checker Page
router.get('/ats-checker', (req, res) => {
    res.render('ats-checker', { title: 'ATS Resume Score Checker' });
});

// Route: Process ATS Score
router.post('/check-ats', upload.single('resumeFile'), async (req, res) => {
    try {
        let resumeText = '';
        const { jobDescription, resumeText: pastedText } = req.body;

        if (!jobDescription) {
            return res.status(400).json({ error: 'Job description is required' });
        }

        // 1. Get Resume Text
        if (req.file) {
            const parser = new PDFParse({ data: req.file.buffer });
            const data = await parser.getText();
            resumeText = data.text;
            await parser.destroy();
        } else if (pastedText) {
            resumeText = pastedText;
        } else {
            return res.status(400).json({ error: 'Please upload a PDF or paste resume text' });
        }

        // 2. Extract JD Keywords
        const jdKeywords = extractKeywords(jobDescription);
        const resumeKeywords = extractKeywords(resumeText);
        
        // 3. Keyword Match Calculation
        const matchedKeywords = jdKeywords.filter(kw => resumeKeywords.includes(kw));
        const missingKeywords = jdKeywords.filter(kw => !resumeKeywords.includes(kw)).slice(0, 10);
        
        const keywordScoreVal = jdKeywords.length > 0 ? (matchedKeywords.length / jdKeywords.length) * 100 : 0;
        
        // 4. Section Score
        const sectionInfo = checkSections(resumeText);
        const sectionScoreVal = (sectionInfo.found.length / 4) * 100;
        
        // 5. Length Score
        const lengthScoreVal = lengthScore(resumeText);
        
        // 6. Final Score Calculation
        const finalScore = Math.round((0.7 * keywordScoreVal) + (0.2 * sectionScoreVal) + (0.1 * lengthScoreVal));
        
        // 7. Generate Suggestions
        const suggestions = [];
        if (missingKeywords.length > 0) {
            suggestions.push(`Add these missing skills: ${missingKeywords.join(', ')}`);
        }
        if (sectionInfo.missing.length > 0) {
            suggestions.push(`Include missing sections: ${sectionInfo.missing.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ')}`);
        }
        if (lengthScoreVal < 100) {
            suggestions.push(lengthScoreVal < 50 ? "Your resume is notably short. Expand on your experiences and projects." : "Consider optimizing your resume length for better ATS readability.");
        }
        if (keywordScoreVal < 70) {
            suggestions.push("Improve alignment with the job description by using more industry-specific keywords.");
        }
        if (suggestions.length === 0) {
            suggestions.push("Great job! Your resume is highly optimized for this role.");
        }

        res.json({
            score: finalScore,
            missingKeywords,
            matchedKeywords,
            suggestions,
            stats: {
                keywords: Math.round(keywordScoreVal),
                sections: Math.round(sectionScoreVal),
                length: Math.round(lengthScoreVal)
            }
        });

    } catch (error) {
        console.error('ATS Checker Detailed Error:', {
            message: error.message,
            stack: error.stack,
            body: req.body,
            file: req.file ? { name: req.file.originalname, size: req.file.size } : 'No file'
        });
        res.status(500).json({ 
            error: 'An error occurred while processing your resume',
            details: error.message
        });
    }
});

module.exports = router;
