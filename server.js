require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcrypt');
const db = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
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

// Basic Routes
app.use('/', pageRoutes);
app.use('/admin', adminRoutes);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
