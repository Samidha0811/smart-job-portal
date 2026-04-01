const jwt = require('jsonwebtoken');

const auth = (roles = []) => {
    return (req, res, next) => {
        const token = req.cookies.token;

        if (!token) {
            if (req.xhr || req.path.startsWith('/api/')) {
                return res.status(401).json({ success: false, message: 'No token provided' });
            }
            return res.redirect('/login');
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;

            // Check if user role is allowed
            if (roles.length && !roles.includes(decoded.role)) {
                if (req.xhr || req.path.startsWith('/api/')) {
                    return res.status(403).json({ success: false, message: 'Access denied' });
                }
                return res.status(403).send('Forbidden: You do not have permission to access this page.');
            }

            next();
        } catch (err) {
            console.error('JWT Verification Error:', err.message);
            res.clearCookie('token');
            if (req.xhr || req.path.startsWith('/api/')) {
                return res.status(401).json({ success: false, message: 'Invalid or expired token' });
            }
            return res.redirect('/login');
        }
    };
};

module.exports = auth;
