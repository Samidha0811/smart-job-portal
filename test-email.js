require('dotenv').config();
const nodemailer = require('nodemailer');

const testMail = async () => {
    console.log('--- Email Test Start ---');
    console.log('User:', process.env.EMAIL_USER);
    
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER, // Sending to yourself for testing
        subject: 'Smart Job Portal - SMTP Test',
        text: 'This is a test email to verify SMTP configuration.'
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('SUCCESS! Email sent:', info.messageId);
    } catch (err) {
        console.error('FAILED! Nodemailer Error:', err.message);
    }
    console.log('--- Email Test End ---');
};

testMail();
