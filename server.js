require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const db = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// View Engine Setup (EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// (Removed temporary in-memory storage)

// Import Routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const pageRoutes = require('./routes/pages');
const recruiterRoutes = require('./routes/recruiter');
const seekerRoutes = require('./routes/seeker');
const resumeRoutes = require('./routes/resume');
const atsRoutes = require('./routes/ats');

// Basic Routes
app.use('/', pageRoutes);
app.use('/', resumeRoutes);
app.use('/', atsRoutes);
app.use('/admin', adminRoutes);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/recruiter', recruiterRoutes);
app.use('/api/seeker', seekerRoutes);

// Direct Recommendation API (Job Seeker only)
const auth = require('./middleware/auth');
const seekerController = require('./controllers/seekerController');
app.get('/api/recommendations', auth(['seeker']), seekerController.getRecommendations);

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
