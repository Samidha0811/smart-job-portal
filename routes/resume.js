const express = require('express');
const router = express.Router();
const puppeteer = require('puppeteer-core');
const path = require('path');

// GET /resume-builder - Render the resume builder page
router.get('/resume-builder', (req, res) => {
    res.render('resume-builder', {
        title: 'Create Your Professional Resume'
    });
});

// POST /download-resume - Generate PDF from HTML
router.post('/download-resume', async (req, res) => {
    const { htmlContent } = req.body;

    if (!htmlContent) {
        return res.status(400).send('No content provided');
    }

    try {
        const browser = await puppeteer.launch({
            headless: true,
            executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        
        // Set content and wait for images/fonts to load
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        
        // Add specific print styles if needed (though already in htmlContent)
        await page.addStyleTag({
            content: `
                body { -webkit-print-color-adjust: exact; }
                .no-print { display: none !important; }
            `
        });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20mm',
                right: '20mm',
                bottom: '20mm',
                left: '20mm'
            }
        });

        await browser.close();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=resume.pdf');
        res.send(pdfBuffer);
    } catch (error) {
        console.error('PDF Generation Error:', error);
        res.status(500).send('Error generating PDF');
    }
});

module.exports = router;
