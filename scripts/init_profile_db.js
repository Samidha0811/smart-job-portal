const fs = require('fs');
const path = require('path');
const db = require('../config/db');
require('dotenv').config();

async function initDB() {
    console.log('Initializing Job Seeker Profile tables...');
    
    try {
        const sqlPath = path.join(__dirname, '../job_seeker_profile.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        // Split by semicolon but handle potential issues with newlines
        const commands = sql
            .split(';')
            .map(cmd => cmd.trim())
            .filter(cmd => cmd.length > 0);

        for (const command of commands) {
            console.log('Executing:', command.substring(0, 50) + '...');
            await db.query(command);
        }

        console.log('✅ All tables created successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error initializing database:', err);
        process.exit(1);
    }
}

initDB();
