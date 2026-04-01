const bcrypt = require('bcrypt');
const db = require('./config/db');

async function createAdmin() {
    const fullname = 'Super Admin';
    const email = 'admin@jobportal.com';
    const password = 'adminPassword123'; // CHANGE THIS!
    const role = 'admin';
    const status = 'active';

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query(
            'INSERT INTO users (fullname, email, password, role, status) VALUES (?, ?, ?, ?, ?)',
            [fullname, email, hashedPassword, role, status]
        );
        console.log('✅ Admin user created successfully!');
        console.log('Email:', email);
        console.log('Password:', password);
        process.exit(0);
    } catch (err) {
        console.error('❌ Error creating admin:', err.message);
        process.exit(1);
    }
}

createAdmin();
