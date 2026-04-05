const nodemailer = require('nodemailer');

/**
 * Reusable mail utility to send notification emails
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} htmlContent - Email body in HTML format
 */
const sendMail = async (to, subject, htmlContent) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: `"Smart Job Portal" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #4a90e2; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px;">${subject}</h2>
                    <div style="font-size: 16px; line-height: 1.6; margin-top: 20px;">
                        ${htmlContent}
                    </div>
                    <p style="margin-top: 30px; font-size: 12px; color: #888;">
                        This is an automated notification from Smart Job Portal. Please do not reply to this email.
                    </p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
        return info;
    } catch (err) {
        console.error('Nodemailer Error:', err.message);
        // We throw the error so the controller can handle it (optional)
        throw new Error('Failed to send email notification');
    }
};

module.exports = sendMail;
