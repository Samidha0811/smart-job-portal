const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const sendMail = require('../utils/sendMail');

const authController = {
    /**
     * Handle user registration
     */
    async register(req, res) {
        const { username, email, password, role } = req.body;

        if (!username || !email || !password || !role) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        try {
            // Check if email already exists
            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({
                    message: `Email '${email}' is already registered. Please go to login.`
                });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const status = (role === 'recruiter') ? 'guest' : 'active';
            const is_verified = (role === 'recruiter') ? 0 : 1; // 0 for recruiters, 1 (active) for others

            const userId = await User.create({
                fullname: username,
                email: email,
                password: hashedPassword,
                role: role,
                status: status,
                is_verified: is_verified
            });

            console.log('New User Registered:', { id: userId, username, role, status });

            // Send Email for Recruiters
            if (role === 'recruiter') {
                try {
                    await sendMail(
                        email,
                        'Profile Under Review',
                        `
                        <p>Hello <strong>${username}</strong>,</p>
                        <p>Thank you for registering as a recruiter on Smart Job Portal.</p>
                        <p>Your recruiter profile is under review. You will be able to login after admin approval.</p>
                        <p>We will notify you once your account is approved.</p>
                        <br>
                        <p>Best Regards,<br>Smart Job Portal Team</p>
                        `
                    );
                } catch (emailErr) {
                    console.error('Registration email failed to send:', emailErr.message);
                    // We don't fail the registration if email fails, but we log it
                }
            }

            res.status(201).json({
                message: (role === 'recruiter') ? 'Registration Successful! Your profile is under review. Check your email for updates.' : 'Registration Successful!',
                userId: userId,
                role: role,
                status: status,
                redirectTo: (role === 'recruiter') ? '/recruiter/register-details' : '/login'
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Something went wrong with the database.' });
        }
    },

    /**
     * Handle user login
     */
    async login(req, res) {
        const { email, password } = req.body;

        try {
            const user = await User.findByEmail(email);

            if (user && await bcrypt.compare(password, user.password)) {
                const token = jwt.sign(
                    { id: user.id, email: user.email, role: user.role },
                    process.env.JWT_SECRET,
                    { expiresIn: '24h' }
                );

                res.cookie('token', token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    maxAge: 24 * 60 * 60 * 1000 // 24 hours
                });

                if (user.role === 'admin') {
                    return res.redirect('/admin');
                } else if (user.role === 'recruiter') {
                    return res.redirect('/recruiter/dashboard');
                } else if (user.role === 'seeker') {
                    return res.redirect('/jobs');
                } else {
                    return res.redirect('/');
                }
            } else {
                res.redirect('/login?error=invalid_credentials');
            }
        } catch (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        }
    },

    /**
     * Handle user logout
     */
    logout(req, res) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/'
        });
        res.redirect('/login');
    },

    /**
     * Get current logged-in user info
     */
    async getMe(req, res) {
        try {
            const user = await User.findById(req.user.id);
            if (user) {
                res.json(user);
            } else {
                res.status(404).json({ message: 'User not found' });
            }
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },

    /**
     * Get user by ID (for demo/admin)
     */
    async getUserById(req, res) {
        try {
            const user = await User.findById(req.params.userId);
            if (user) {
                res.json(user);
            } else {
                res.status(404).json({ message: 'User not found' });
            }
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
};

module.exports = authController;
